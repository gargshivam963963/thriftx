import type { ShippingRate, ShipmentStatus } from "../types";
import { PICKUP_ADDRESS } from "../constants";

import type {
  CreateShipmentPayload,
  PickupResult,
  ShipmentResult,
  ShippingProvider,
  TrackingResult,
} from "./base";

import { shiprocketFetch } from "./client";
import { getAvailableCouriers } from "./couriers";

interface ShiprocketShipmentResponse {
  shipment_id?: string | number;
  order_id?: string | number;
  awb_code?: string;
  awb?: string;
  courier_name?: string;
  courier_company_id?: string | number;
  tracking_url?: string;
  label_url?: string;
  invoice_url?: string;
  estimated_delivery_date?: string;
  status?: string;
  status_code?: string | number;
  message?: string;
  error?: string;
  errors?: unknown;
  payload?: ShiprocketShipmentResponse;
  data?: ShiprocketShipmentResponse;
}

interface ShiprocketPickupResponse {
  pickup_id?: string | number;
  pickup_status?: number | string;
  response?: {
    pickup_scheduled_date?: string;
    pickup_token_number?: string;
    message?: string;
  };
}

interface ShiprocketTrackingEventResponse {
  current_status?: string;
  activity?: string;
  location?: string;
  date?: string;
}

interface ShiprocketTrackingResponse {
  tracking_data?: ShiprocketTrackingEventResponse[];
}

interface ShiprocketLabelResponse {
  label_url?: string;
}

function mapShiprocketStatus(status: string): ShipmentStatus {
  const normalized = (status || "").toLowerCase();

  if (normalized.includes("delivered")) {
    return "delivered";
  }

  if (normalized.includes("cancelled") || normalized.includes("cancel")) {
    return "cancelled";
  }

  if (normalized.includes("rto") || normalized.includes("return")) {
    return "rto";
  }

  if (normalized.includes("out for delivery")) {
    return "out_for_delivery";
  }

  if (normalized.includes("picked up") || normalized.includes("pickup")) {
    return "picked_up";
  }

  if (normalized.includes("in transit") || normalized.includes("transit")) {
    return "in_transit";
  }

  if (
    normalized.includes("shipment created") ||
    normalized.includes("created")
  ) {
    return "shipment_created";
  }

  if (normalized.includes("confirmed")) {
    return "confirmed";
  }

  if (normalized.includes("packed")) {
    return "packed";
  }

  return "in_transit";
}

export class ShiprocketProvider implements ShippingProvider {
  readonly provider = "shiprocket";

  async createShipment(
    payload: CreateShipmentPayload,
  ): Promise<ShipmentResult> {
    try {
      const orderItems =
        payload.items && payload.items.length > 0
          ? payload.items.map((item, index) => ({
              name: item.title || `THRIFTX Item ${index + 1}`,

              sku: String(item.id || `${payload.orderId}-${index + 1}`),

              units: Number(item.quantity) || 1,

              selling_price: Number(item.price) || payload.amount,

              discount: 0,
            }))
          : [
              {
                name: "THRIFTX Order",

                sku: payload.orderId,

                units: 1,

                selling_price: payload.amount,

                discount: 0,
              },
            ];

      const response = await shiprocketFetch<ShiprocketShipmentResponse>(
        "/orders/create/adhoc",
        {
          method: "POST",

          body: JSON.stringify({
            order_id: payload.orderId,

            order_date: new Date().toISOString().slice(0, 10),

            pickup_location: PICKUP_ADDRESS.pickupLocation,

            pickup_customer_name: "ThriftX",

            pickup_address: PICKUP_ADDRESS.address,

            pickup_city: PICKUP_ADDRESS.city,

            pickup_state: PICKUP_ADDRESS.state,

            pickup_country: PICKUP_ADDRESS.country,

            pickup_pincode: PICKUP_ADDRESS.pincode,

            pickup_email: PICKUP_ADDRESS.email,

            pickup_phone: PICKUP_ADDRESS.phone,

            billing_customer_name: payload.customerName,

            billing_last_name:
              payload.customerName.trim().split(/\s+/).slice(1).join(" ") ||
              payload.customerName.trim().split(/\s+/)[0] ||
              "Customer",

            billing_address: payload.address,

            billing_city: payload.city,

            billing_pincode: payload.pincode,

            billing_state: payload.state,

            billing_country: payload.country,

            billing_email: payload.email ?? "",

            billing_phone: payload.phone,

            shipping_is_billing: true,

            order_items: orderItems,

            payment_method: payload.cod ? "COD" : "Prepaid",

            sub_total: payload.amount,

            length: payload.length,

            breadth: payload.width,

            height: payload.height,

            weight: payload.weight,
          }),
        },
      );

      const raw = response as ShiprocketShipmentResponse;
      const src =
        raw?.payload?.shipment_id != null
          ? (raw.payload as ShiprocketShipmentResponse)
          : raw?.data?.shipment_id != null
            ? (raw.data as ShiprocketShipmentResponse)
            : raw;

      const shipmentId = String(src.shipment_id ?? "");

      if (!shipmentId) {
        const msg =
          (typeof src.message === "string" && src.message.trim()) ||
          (typeof src.error === "string" && src.error.trim()) ||
          (typeof src.errors === "string" && src.errors.trim()) ||
          (src.errors && typeof src.errors === "object"
            ? JSON.stringify(src.errors).slice(0, 500)
            : "") ||
          "Shiprocket did not return a shipment ID.";
        // Append the exact nickname we sent so the admin can compare it
        // with Shiprocket dashboard → Settings → Pickup & RTO addresses.
        // This mismatch is the #1 cause of adhoc order rejection.
        const hinted =
          /pickup location/i.test(msg) || /pickup_location/i.test(msg)
            ? `${msg} (sent pickup_location="${PICKUP_ADDRESS.pickupLocation}" — must exactly match the nickname in your Shiprocket dashboard; check /api/shipping/diagnose for the valid list)`
            : msg;
        console.error(
          "[Shiprocket] Order creation returned no shipment_id:",
          JSON.stringify(response).slice(0, 2000),
        );
        return {
          success: false,
          message: hinted,
        };
      }

      const awbCode = src.awb_code ?? src.awb ?? "";

      return {
        success: true,

        shipmentId,

        orderId: String(src.order_id ?? ""),

        awbCode,

        courierName: src.courier_name ?? "",

        courierCompanyId: src.courier_company_id
          ? Number(src.courier_company_id)
          : undefined,

        /*
         * AWB is the tracking number.
         * Never use shipment_id as an AWB.
         */
        trackingNumber: awbCode,

        trackingUrl: src.tracking_url ?? "",

        labelUrl: src.label_url ?? "",

        invoiceUrl: src.invoice_url ?? "",

        estimatedDelivery: src.estimated_delivery_date ?? "",

        shipment: {
          shipmentId,

          provider: "shiprocket",

          courier: {
            id: String(src.courier_company_id ?? ""),

            name: src.courier_name ?? "",

            provider: "shiprocket",
          },

          method: "standard",

          status: "shipment_created",

          shippingCharge: 0,

          pickup: {
            status: "pending",
          },

          tracking: [],

          createdAt: new Date().toISOString(),

          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("[Shiprocket] Shipment creation failed:", error);

      return {
        success: false,

        message:
          error instanceof Error ? error.message : "Shipment creation failed.",
      };
    }
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      const id = Number(shipmentId);

      if (!Number.isInteger(id) || id <= 0) {
        return false;
      }

      await shiprocketFetch("/orders/cancel", {
        method: "POST",

        body: JSON.stringify({
          ids: [id],
        }),
      });

      return true;
    } catch (error) {
      console.error("[Shiprocket] Cancel failed:", error);

      return false;
    }
  }

  async schedulePickup(shipmentId: string): Promise<PickupResult> {
    try {
      const id = Number(shipmentId);

      if (!Number.isInteger(id) || id <= 0) {
        return {
          success: false,
          message: "Invalid Shiprocket shipment ID.",
        };
      }

      const response = await shiprocketFetch<ShiprocketPickupResponse>(
        "/courier/generate/pickup",
        {
          method: "POST",

          body: JSON.stringify({
            shipment_id: [id],
          }),
        },
      );

      const pickupConfirmed = Number(response.pickup_status) === 1;

      const scheduledAt = response.response?.pickup_scheduled_date;

      const pickupId =
        response.pickup_id !== undefined && response.pickup_id !== null
          ? String(response.pickup_id)
          : undefined;

      if (!pickupConfirmed) {
        return {
          success: false,

          pickup: {
            pickupId,

            scheduledAt,

            status: "pending",
          },

          message:
            response.response?.message ||
            "Shiprocket did not confirm pickup scheduling.",
        };
      }

      return {
        success: true,

        pickup: {
          pickupId,

          scheduledAt: scheduledAt || new Date().toISOString(),

          status: "scheduled",
        },
      };
    } catch (error) {
      console.error("[Shiprocket] Pickup scheduling failed:", error);

      return {
        success: false,

        message:
          error instanceof Error ? error.message : "Pickup scheduling failed.",
      };
    }
  }

  async getTracking(trackingNumber: string): Promise<TrackingResult> {
    try {
      const awb = trackingNumber.trim();

      if (!awb) {
        return {
          success: false,
          message: "AWB is required for tracking.",
        };
      }

      const response = await shiprocketFetch<ShiprocketTrackingResponse>(
        `/courier/track/awb/${encodeURIComponent(awb)}`,
      );

      const trackingData = response?.tracking_data ?? [];

      const events = Array.isArray(trackingData)
        ? trackingData.map((event) => ({
            status: mapShiprocketStatus(event.current_status ?? ""),

            description: event.activity ?? "Shipment update",

            location: event.location ?? "",

            timestamp: event.date ?? new Date().toISOString(),
          }))
        : [];

      const latestStatus = events[0]?.status ?? "shipment_created";

      return {
        success: true,

        status: latestStatus,

        tracking: events,
      };
    } catch (error) {
      console.error("[Shiprocket] Tracking failed:", error);

      return {
        success: false,

        message:
          error instanceof Error ? error.message : "Tracking fetch failed.",
      };
    }
  }

  async generateLabel(shipmentId: string): Promise<string | null> {
    try {
      const id = Number(shipmentId);

      if (!Number.isInteger(id) || id <= 0) {
        return null;
      }

      const response = await shiprocketFetch<ShiprocketLabelResponse>(
        "/courier/generate/label",
        {
          method: "POST",

          body: JSON.stringify({
            shipment_id: [id],
          }),
        },
      );

      return response.label_url ?? null;
    } catch (error) {
      console.error("[Shiprocket] Label generation failed:", error);

      return null;
    }
  }

  async getShippingRates(
    pincode: string,
    weight: number,
    cod = false,
  ): Promise<ShippingRate[]> {
    if (!/^\d{6}$/.test(pincode)) {
      throw new Error("A valid 6-digit delivery PIN is required.");
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error("A valid shipment weight is required.");
    }

    // Do not catch the provider error here and silently return
    // preset prices. The caller must know when live rates failed.
    const couriers = await getAvailableCouriers(
      PICKUP_ADDRESS.pincode,
      pincode,
      cod,
      weight,
    );

    if (couriers.length === 0) {
      throw new Error(
        "No Shiprocket courier is available for this destination and payment mode.",
      );
    }

    return couriers
      .filter(
        (courier) =>
          Number.isFinite(courier.freightCharge) && courier.freightCharge >= 0,
      )
      .map((courier) => ({
        courierId: String(courier.courierCompanyId),
        courierName: courier.courierName,
        method: "standard" as const,
        amount: courier.freightCharge,
        estimatedDays: Number.parseInt(courier.estimatedDays, 10) || 5,
        codAvailable: true,
        trackingAvailable: true,
      }));
  }
}

export const shiprocketProvider = new ShiprocketProvider();
