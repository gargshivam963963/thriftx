import type { ShippingRate, Shipment } from "../types";

import type {
  CreateShipmentPayload,
  PickupResult,
  ShipmentResult,
  ShippingProvider,
  TrackingResult,
} from "./base";
import { shiprocketFetch } from "./client";

export class ShiprocketProvider implements ShippingProvider {
  readonly provider = "shiprocket";

  async createShipment(
    payload: CreateShipmentPayload,
  ): Promise<ShipmentResult> {
    try {
      const response = await shiprocketFetch<any>("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify({
          order_id: payload.orderId,
          order_date: new Date().toISOString(),

          pickup_location: "Primary",

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

          order_items: [
            {
              name: "THRIFTX Order",
              sku: payload.orderId,
              units: 1,
              selling_price: payload.amount,
            },
          ],

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
    console.log("[Shiprocket] Cancel Shipment", shipmentId);

    // TODO

    return false;
  }

  async schedulePickup(shipmentId: string): Promise<PickupResult> {
    console.log("[Shiprocket] Schedule Pickup", shipmentId);

    // TODO

    return {
      success: false,
      message: "Pickup scheduling not implemented.",
    };
  }

  async getTracking(trackingNumber: string): Promise<TrackingResult> {
    console.log("[Shiprocket] Tracking", trackingNumber);

    // TODO

    return {
      success: false,
      message: "Tracking not implemented.",
    };
  }

  async generateLabel(shipmentId: string): Promise<string | null> {
    console.log("[Shiprocket] Generate Label", shipmentId);

    // TODO

    return null;
  }

  async getShippingRates(
    pincode: string,
    weight: number,
  ): Promise<ShippingRate[]> {
    console.log("[Shiprocket] Shipping Rates", {
      pincode,
      weight,
    });

    // TODO

    return [];
  }
}

export const shiprocketProvider = new ShiprocketProvider();
