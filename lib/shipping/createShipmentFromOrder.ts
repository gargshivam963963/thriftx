import {
  getOrder,
  updateOrderStatus,
  updateShipment,
} from "@/lib/services/orderService";

import { shipmentService } from "./services/shipment";
import { getBestCourier } from "./services/courier";
import { generateAwb } from "./services/awb";

import {
  acquireShipmentCreationLock,
  releaseShipmentCreationLock,
} from "./shipmentCreationLock";

import { PICKUP_ADDRESS, SHIPPING_DEFAULTS } from "./constants";

import { SHIPPING_PROVIDERS } from "@/lib/shipping/checkout-options";

interface OrderItem {
  id?: string;
  title?: string;
  price?: number | string;
  quantity?: number;
}

function parseOrderItems(raw: string): OrderItem[] {
  try {
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export async function createShipmentFromOrder(orderId: string) {
  let order;

  try {
    order = await getOrder(orderId);
  } catch {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  if (!order) {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  /*
   * Local (THRIFTX-managed) delivery is fulfilled by the merchant, not
   * by an external courier. Skip every shipment step for local orders so
   * no Shiprocket request is ever made for a Panipat customer.
   */
  if (order.shippingProvider === SHIPPING_PROVIDERS.LOCAL) {
    return {
      success: true,
      message: "Local delivery — no external shipment required.",
    };
  }

  /*
   * Database-backed lock.
   *
   * This prevents two simultaneous admin requests from
   * creating two real Shiprocket shipments.
   */
  const lockToken = await acquireShipmentCreationLock(orderId);

  if (!lockToken) {
    return {
      success: false,
      code: "SHIPMENT_CREATION_IN_PROGRESS",
      message:
        "Shipment creation is already in progress for this order. Please try again shortly.",
    };
  }

  try {
    /*
     * Always reload after obtaining the lock.
     */
    try {
      order = await getOrder(orderId);
    } catch {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    if (!order) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    /*
     * If the complete shipping workflow already exists,
     * return it instead of creating anything again.
     */
    if (
      order.shipmentId &&
      order.awbNumber &&
      order.pickupStatus === "scheduled"
    ) {
      return {
        success: true,
        shipmentId: order.shipmentId,
        trackingNumber: order.trackingNumber || order.awbNumber,
        trackingUrl: order.trackingUrl || "",
        labelUrl: order.labelUrl || "",
        estimatedDelivery: order.estimatedDelivery || "",
        message: "Shipment already exists and pickup is scheduled.",
      };
    }

    const items = parseOrderItems(order.products);

    const weight = SHIPPING_DEFAULTS.defaultWeight;
    const length = SHIPPING_DEFAULTS.defaultLength;
    const width = SHIPPING_DEFAULTS.defaultWidth;
    const height = SHIPPING_DEFAULTS.defaultHeight;

    const cod = order.paymentMethod === "cod";

    /*
     * ---------------------------------------------------------
     * STEP 1 — CREATE SHIPROCKET SHIPMENT
     * ---------------------------------------------------------
     *
     * If shipmentId already exists, this is a retry/resume.
     * Do NOT create another Shiprocket order.
     */

    let shipmentId = order.shipmentId || "";

    let createdShipment: Awaited<
      ReturnType<typeof shipmentService.createShipment>
    > | null = null;

    if (!shipmentId) {
      createdShipment = await shipmentService.createShipment({
        orderId: order.orderId,

        customerName: `${order.firstName} ${order.lastName}`.trim(),

        email: order.email ?? "",

        phone: order.phone,

        address: order.address,

        city: order.city,

        state: order.state || "Haryana",

        country: order.country || "India",

        pincode: order.postalCode,

        amount: Number(order.total),

        cod,

        weight,

        length,

        width,

        height,

        items,
      });

      if (!createdShipment.success) {
        return {
          success: false,
          message:
            createdShipment.message || "Shiprocket shipment creation failed.",
          details: (createdShipment as { details?: unknown }).details,
        };
      }

      shipmentId = createdShipment.shipmentId || "";

      if (!shipmentId) {
        const providerShipment = (createdShipment as { shipment?: unknown }).shipment;
        return {
          success: false,
          message:
            createdShipment.message ||
            "Shiprocket accepted the request but did not return a shipment ID.",
          details: providerShipment,
        };
      }

      await updateShipment(order.$id, {
        shippingProvider: "shiprocket",

        shipmentStatus: "shipment_created",

        pickupStatus: "pending",

        shipmentId,

        trackingNumber: createdShipment.trackingNumber || "",

        trackingUrl: createdShipment.trackingUrl || "",

        labelUrl: createdShipment.labelUrl || "",

        invoiceUrl: createdShipment.invoiceUrl || "",

        estimatedDelivery: createdShipment.estimatedDelivery || "",
      });

      /*
       * Shipment exists in Shiprocket, but pickup has not
       * happened yet. THRIFTX must therefore remain Processing.
       */
      if (order.status !== "Processing") {
        await updateOrderStatus(order.$id, "Processing");
      }
    }

    /*
     * Reload persisted state.
     */
    order = await getOrder(orderId);

    /*
     * ---------------------------------------------------------
     * STEP 2 — COURIER
     * ---------------------------------------------------------
     *
     * Reuse an already assigned courier when available.
     * Otherwise select one from live Shiprocket serviceability.
     */

    let courierCompanyId = order.courierId ? Number(order.courierId) : 0;

    let courierName = order.courier || "";

    let courier: Awaited<ReturnType<typeof getBestCourier>> | null = null;

    if (!courierCompanyId) {
      try {
        courier = await getBestCourier(
          PICKUP_ADDRESS.pincode,
          order.postalCode,
          cod,
          weight,
        );
      } catch (error) {
        return {
          success: false,
          shipmentId,
          message:
            error instanceof Error
              ? `Shipment created, but courier selection failed: ${error.message}`
              : "Shipment created, but courier selection failed.",
        };
      }

      courierCompanyId = courier.courierCompanyId;
      courierName = courier.courierName;
    }

    /*
     * ---------------------------------------------------------
     * STEP 3 — AWB
     * ---------------------------------------------------------
     *
     * Never request another AWB if one is already stored.
     */

    let awbCode = order.awbNumber || "";

    if (!awbCode) {
      let awb;

      try {
        awb = await generateAwb(shipmentId, courierCompanyId);
      } catch (error) {
        await updateShipment(order.$id, {
          shippingProvider: "shiprocket",
          shipmentStatus: "shipment_created",
          pickupStatus: "pending",
          shipmentId,
          courier: courierName,
          courierId: String(courierCompanyId),
        });

        return {
          success: false,
          shipmentId,
          courier,
          message:
            error instanceof Error
              ? `Shipment exists and courier was selected, but AWB assignment failed: ${error.message}`
              : "Shipment exists and courier was selected, but AWB assignment failed.",
        };
      }

      awbCode = awb?.awb_code || "";

      if (!awbCode) {
        await updateShipment(order.$id, {
          shippingProvider: "shiprocket",
          shipmentStatus: "shipment_created",
          pickupStatus: "pending",
          shipmentId,
          courier: courierName,
          courierId: String(courierCompanyId),
        });

        return {
          success: false,
          shipmentId,
          courier,
          message: "Shiprocket did not return an AWB after courier assignment.",
        };
      }

      await updateShipment(order.$id, {
        shippingProvider: "shiprocket",

        shipmentStatus: "shipment_created",

        pickupStatus: "pending",

        shipmentId,

        courier: courierName,

        courierId: String(courierCompanyId),

        awbNumber: awbCode,

        trackingNumber: awbCode,

        trackingUrl:
          order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,
      });
    } else {
      /*
       * Make sure courier information is persisted even
       * when this is a retry of an existing AWB.
       */
      await updateShipment(order.$id, {
        shippingProvider: "shiprocket",

        shipmentStatus: order.shipmentStatus || "shipment_created",

        pickupStatus: order.pickupStatus || "pending",

        shipmentId,

        courier: courierName,

        courierId: String(courierCompanyId),

        awbNumber: awbCode,

        trackingNumber: order.trackingNumber || awbCode,

        trackingUrl:
          order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,
      });
    }

    /*
     * ---------------------------------------------------------
     * STEP 4 — REAL PICKUP REQUEST
     * ---------------------------------------------------------
     *
     * Only request pickup when it isn't already scheduled.
     */

    order = await getOrder(orderId);

    if (order.pickupStatus !== "scheduled") {
      const pickupResult = await shipmentService.schedulePickup(shipmentId);

      if (
        !pickupResult.success ||
        pickupResult.pickup?.status !== "scheduled"
      ) {
        await updateShipment(order.$id, {
          shippingProvider: "shiprocket",

          shipmentStatus: "shipment_created",

          pickupStatus: "failed",

          shipmentId,

          courier: courierName,

          courierId: String(courierCompanyId),

          awbNumber: awbCode,

          trackingNumber: order.trackingNumber || awbCode,

          trackingUrl:
            order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,
        });

        return {
          success: false,

          shipmentId,

          trackingNumber: awbCode,

          courier,

          pickup: pickupResult.pickup,

          message:
            pickupResult.message ||
            "AWB is assigned, but Shiprocket did not confirm pickup scheduling.",
        };
      }

      await updateShipment(order.$id, {
        shippingProvider: "shiprocket",

        shipmentStatus: "pickup_scheduled",

        pickupStatus: "scheduled",

        shipmentId,

        courier: courierName,

        courierId: String(courierCompanyId),

        awbNumber: awbCode,

        trackingNumber: awbCode,

        trackingUrl:
          order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,

        pickupId: pickupResult.pickup?.pickupId,

        shippedAt: pickupResult.pickup?.scheduledAt || new Date().toISOString(),
      });

      /*
       * IMPORTANT:
       * Only after Shiprocket confirms pickup scheduling
       * does THRIFTX become Shipped.
       */
      await updateOrderStatus(order.$id, "Shipped");

      return {
        success: true,

        shipmentId,

        trackingNumber: awbCode,

        trackingUrl:
          order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,

        courier,

        awb: {
          awb_code: awbCode,
        },

        pickup: pickupResult.pickup,

        message: "Shipment created, AWB assigned and pickup scheduled.",
      };
    }

    /*
     * Pickup was already scheduled before this request.
     */
    if (order.status !== "Shipped") {
      await updateOrderStatus(order.$id, "Shipped");
    }

    return {
      success: true,

      shipmentId,

      trackingNumber: awbCode,

      trackingUrl:
        order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,

      message: "Shipment already exists and pickup is scheduled.",
    };
  } finally {
    await releaseShipmentCreationLock(orderId, lockToken);
  }
}
