import type { Shipment, ShippingRate } from "../types";

import { DEFAULT_SHIPPING_PROVIDER } from "../constants";

import { shiprocketProvider } from "../providers/shiprocket";

import type {
  CreateShipmentPayload,
  ShipmentResult,
  PickupResult,
  TrackingResult,
  ShippingProvider,
} from "../providers/base";

class ShipmentService {
  private provider: ShippingProvider;

  constructor() {
    switch (DEFAULT_SHIPPING_PROVIDER) {
      case "shiprocket":
      default:
        this.provider = shiprocketProvider;
        break;
    }
  }

  getProvider(): ShippingProvider {
    return this.provider;
  }

  async createShipment(
    payload: CreateShipmentPayload,
  ): Promise<ShipmentResult> {
    return this.provider.createShipment(payload);
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    return this.provider.cancelShipment(shipmentId);
  }

  async schedulePickup(shipmentId: string): Promise<PickupResult> {
    return this.provider.schedulePickup(shipmentId);
  }

  async getTracking(trackingNumber: string): Promise<TrackingResult> {
    return this.provider.getTracking(trackingNumber);
  }

  async generateLabel(shipmentId: string): Promise<string | null> {
    return this.provider.generateLabel(shipmentId);
  }

  async getShippingRates(
    pincode: string,
    weight: number,
  ): Promise<ShippingRate[]> {
    return this.provider.getShippingRates(pincode, weight);
  }
}

export const shipmentService = new ShipmentService();

export default shipmentService;
