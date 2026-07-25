import { schedulePickup } from "../providers/pickup";

export async function requestPickup(shipmentId: string) {
  return schedulePickup(shipmentId);
}
