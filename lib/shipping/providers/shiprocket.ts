import type { ShippingRate, ShipmentStatus } from "../types";
import { PICKUP_ADDRESS, FALLBACK_SHIPPING_RATES } from "../constants";
import { detectDeliveryZone } from "@/lib/delivery";

import type {
  CreateShipmentPayload,
  PickupResult,
  ShipmentResult,
  ShippingProvider,
  TrackingResult,
} from "./base";
import { shiprocketFetch } from "./client";
import { getAvailableCouriers } from "./couriers";

/**
 * Map Shiprocket shipment status strings to our internal ShipmentStatus.
 */
function mapShiprocketStatus(status: string): ShipmentStatus {
  const normalized = (status || "").toLowerCase();

  if (normalized.includes("delivered")) return "delivered";
  if (normalized.includes("cancelled") || normalized.includes("cancel"))
    return "cancelled";
  if (normalized.includes("rto") || normalized.includes("return")) return "rto";
  if (normalized.includes("out for delivery")) return "out_for_delivery";
  if (normalized.includes("picked up") || normalized.includes("pickup"))
    return "picked_up";
  if (normalized.includes("in transit") || normalized.includes("transit"))
    return "in_transit";
  if (normalized.includes("shipment created") || normalized.includes("created"))
    return "shipment_created";
  if (normalized.includes("confirmed")) return "confirmed";
  if (normalized.includes("packed")) return "packed";

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

      const response = await shiprocketFetch<any>("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify({
          order_id: payload.orderId,
          order_date: new Date().toISOString().slice(0, 10),

          pickup_location: PICKUP_ADDRESS.name,
          pickup_customer_name: "ThriftX",
          pickup_address: PICKUP_ADDRESS.address,
          pickup_city: PICKUP_ADDRESS.city,
          pickup_state: PICKUP_ADDRESS.state,
          pickup_country: PICKUP_ADDRESS.country,
          pickup_pincode: PICKUP_ADDRESS.pincode,
          pickup_email: PICKUP_ADDRESS.email,
          pickup_phone: PICKUP_ADDRESS.phone,

          billing_customer_name: payload.customerName,
          billing_last_name: "",

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
      });

      return {
        success: true,

        shipmentId: String(response.shipment_id ?? ""),

        orderId: String(response.order_id ?? ""),

        awbCode: response.awb_code ?? "",

        courierName: response.courier_name ?? "",

        courierCompanyId: response.courier_company_id,

        trackingNumber: response.awb_code ?? String(response.shipment_id ?? ""),

        trackingUrl: response.tracking_url ?? "",

        labelUrl: response.label_url ?? "",

        invoiceUrl: response.invoice_url ?? "",

        estimatedDelivery: response.estimated_delivery_date ?? "",

        shipment: {
          shipmentId: String(response.shipment_id ?? ""),

          provider: "shiprocket",

          courier: {
            id: response.courier_company_id ?? "",

            name: response.courier_name ?? "",

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
      return {
        success: false,

        message:
          error instanceof Error ? error.message : "Shipment creation failed.",
      };
    }
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      await shiprocketFetch(`/orders/cancel`, {
        method: "POST",
        body: JSON.stringify({ ids: [parseInt(shipmentId, 10)] }),
      });
      return true;
    } catch (error) {
      console.error("[Shiprocket] Cancel failed:", error);
      return false;
    }
  }

  async schedulePickup(shipmentId: string): Promise<PickupResult> {
    try {
      const response = await shiprocketFetch<any>(`/courier/generate/pickup`, {
        method: "POST",
        body: JSON.stringify({
          shipment_id: [parseInt(shipmentId, 10)],
        }),
      });

      return {
        success: true,
        pickup: {
          pickupId: response.pickup_id ?? String(Date.now()),
          scheduledAt: new Date().toISOString(),
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
      const response = await shiprocketFetch<any>(
        `/tracking?shipment_id=${trackingNumber}`,
      );

      const trackingData = response?.tracking_data ?? response;

      const events = Array.isArray(trackingData)
        ? trackingData.map((event: any) => ({
            status:
              mapShiprocketStatus(event.current_status ?? "") ?? "in_transit",
            description: event.activity ?? "In transit",
            location: event.location ?? "",
            timestamp: event.date ?? new Date().toISOString(),
          }))
        : [];

      // Determine current status from the latest event if present.
      const latestStatus = events[0]?.status ?? "in_transit";

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
      const response = await shiprocketFetch<any>(`/courier/generate/label`, {
        method: "POST",
        body: JSON.stringify({
          shipment_id: [parseInt(shipmentId, 10)],
        }),
      });

      return response.label_url ?? null;
    } catch (error) {
      console.error("[Shiprocket] Label generation failed:", error);
      return null;
    }
  }

  async getShippingRates(
    pincode: string,
    weight: number,
  ): Promise<ShippingRate[]> {
    try {
      // Try Shiprocket API first
      const couriers = await getAvailableCouriers(
        PICKUP_ADDRESS.pincode,
        pincode,
        true, // COD
        weight,
      );

      if (couriers.length > 0) {
        return couriers.map((c) => ({
          courierId: String(c.courierCompanyId),
          courierName: c.courierName,
          method: c.freightCharge > 70 ? "express" : "standard",
          amount: c.freightCharge,
          estimatedDays: parseInt(c.estimatedDays, 10) || 5,
          codAvailable: true,
          trackingAvailable: true,
        }));
      }

      // Fallback to preset rates if API returns nothing
      return this.getFallbackRates(pincode);
    } catch {
      // If Shiprocket is not configured, return fallback rates
      console.warn(
        "[Shiprocket] API call failed, using fallback rates. Set SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD env vars to enable live rates.",
      );
      return this.getFallbackRates(pincode);
    }
  }

  /**
   * Return preset rates when Shiprocket is not configured.
   * This makes the shipping integration work without credentials.
   */
  private getFallbackRates(pincode: string): ShippingRate[] {
    const zone = detectDeliveryZone("", pincode);
    const rates =
      FALLBACK_SHIPPING_RATES[zone === "local" ? "local" : "courier"];

    return Object.entries(rates).map(([method, config]) => ({
      courierId: `fallback_${method}`,
      courierName: config.name,
      method: method as "standard" | "express",
      amount: config.price,
      estimatedDays: method === "express" ? 3 : 6,
      codAvailable: true,
      trackingAvailable: method !== "local",
    }));
  }
}

export const shiprocketProvider = new ShiprocketProvider();
