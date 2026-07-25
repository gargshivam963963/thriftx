import type { ShipmentStatus, TrackingEvent } from "../types";

import shipmentService from "./shipment";

class TrackingService {
  /**
   * Get complete tracking timeline
   */
  async getTracking(trackingNumber: string): Promise<TrackingEvent[]> {
    const result = await shipmentService.getTracking(trackingNumber);

    if (!result.success || !result.tracking) {
      return [];
    }

    return result.tracking;
  }

  /**
   * Get current shipment status
   */
  async getCurrentStatus(
    trackingNumber: string,
  ): Promise<ShipmentStatus | null> {
    const result = await shipmentService.getTracking(trackingNumber);

    if (!result.success || !result.status) {
      return null;
    }

    return result.status;
  }

  /**
   * Check if shipment is delivered
   */
  async isDelivered(trackingNumber: string): Promise<boolean> {
    const status = await this.getCurrentStatus(trackingNumber);

    return status === "delivered";
  }

  /**
   * Check if shipment is cancelled
   */
  async isCancelled(trackingNumber: string): Promise<boolean> {
    const status = await this.getCurrentStatus(trackingNumber);

    return status === "cancelled";
  }
}

export const trackingService = new TrackingService();

export default trackingService;
