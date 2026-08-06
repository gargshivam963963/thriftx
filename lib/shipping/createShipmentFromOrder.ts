import { getOrder, updateShipment } from "@/lib/services/orderService";
import { shipmentService } from "./services/shipment";
import { getBestCourier } from "./services/courier";
import { generateAwb } from "./services/awb";
import { requestPickup } from "./services/pickupScheduler";
import { PICKUP_ADDRESS, SHIPPING_DEFAULTS } from "./constants";
import type { Order } from "@/lib/types/order";

interface OrderItem {
  id?: string;
  title?: string;
  price?: number | string;
  quantity?: number;
}

/**
 * Parse the order's stored product JSON into a typed array.
 */
function parseOrderItems(raw: string): OrderItem[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Create a Shiprocket shipment from a stored order.
 * Uses the configured pickup address + shipping defaults so nothing is hardcoded.
 * Returns the full result (shipment, courier, AWB, pickup) or an error result.
 */
export async function createShipmentFromOrder(orderId: string) {
  const order = await getOrder(orderId);

  const items = parseOrderItems(order.products);
  const weight = SHIPPING_DEFAULTS.defaultWeight;
  const length = SHIPPING_DEFAULTS.defaultLength;
  const width = SHIPPING_DEFAULTS.defaultWidth;
  const height = SHIPPING_DEFAULTS.defaultHeight;

  const result = await shipmentService.createShipment({
    orderId: order.orderId,
    customerName: `${order.firstName} ${order.lastName}`.trim(),
    email: order.email ?? "",
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state || "Haryana",
    country: order.country || "India",
    pincode: order.postalCode,
    amount: order.total,
    cod: order.paymentMethod === "cod",
    weight,
    length,
    width,
    height,
    items,
  });

  if (!result.success || !result.shipment) {
    return result;
  }

  try {
    const bestCourier = await getBestCourier(
      PICKUP_ADDRESS.pincode,
      order.postalCode,
      order.paymentMethod === "cod",
      weight,
    );

    const awb = await generateAwb(
      result.shipment.shipmentId ?? "",
      bestCourier.courierCompanyId,
    );

    const pickup = await requestPickup(result.shipment.shipmentId ?? "");

    await updateShipment(order.$id, {
      shippingProvider: "shiprocket",

      shipmentStatus: "recommended_to_ship",

      pickupStatus: pickup?.pickup_status === 1 ? "scheduled" : "pending",

      shipmentId: result.shipment.shipmentId,

      courier: bestCourier.courierName,

      courierId: String(bestCourier.courierCompanyId),

      awbNumber: awb?.awb_code,

      trackingNumber: awb?.awb_code,

      trackingUrl: result.trackingUrl,

      labelUrl: result.labelUrl,

      invoiceUrl: result.invoiceUrl,

      estimatedDelivery: result.estimatedDelivery,
    });

    return {
      ...result,
      courier: bestCourier,
      awb,
      pickup,
    };
  } catch (error) {
    // Shipment created but AWB/pickup failed — still return the shipment result
    return {
      ...result,
      message:
        error instanceof Error
          ? `Shipment created, but AWB/pickup failed: ${error.message}`
          : "Shipment created, but AWB/pickup failed.",
    };
  }
}
