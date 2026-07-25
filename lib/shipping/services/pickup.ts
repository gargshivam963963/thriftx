import type { PickupDetails } from "../types";

import shipmentService from "./shipment";

class PickupService {
  /**
   * Schedule courier pickup
   */
  async schedule(shipmentId: string): Promise<PickupDetails | null> {
    const result = await shipmentService.schedulePickup(shipmentId);

    if (!result.success || !result.pickup) {
      return null;
    }

    return result.pickup;
  }

  /**
   * Check pickup status
   */
  async getStatus(shipmentId: string): Promise<PickupDetails | null> {
    const result = await shipmentService.schedulePickup(shipmentId);

    if (!result.success || !result.pickup) {
      return null;
    }

    return result.pickup;
  }

  /**
   * Has shipment been picked up?
   */
  async isPickedUp(shipmentId: string): Promise<boolean> {
    const pickup = await this.getStatus(shipmentId);

    return pickup?.status === "picked_up";
  }

  /**
   * Is pickup scheduled?
   */
  async isScheduled(shipmentId: string): Promise<boolean> {
    const pickup = await this.getStatus(shipmentId);

    return pickup?.status === "scheduled";
  }
}

export const pickupService = new PickupService();

export default pickupService;
