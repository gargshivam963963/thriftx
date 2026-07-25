import { getTracking } from "../providers/tracking";
import { updateShipment } from "@/lib/services/orderService";

export async function syncTracking(orderId: string, awb: string) {
  const response = await getTracking(awb);

  const latest = response.tracking_data?.shipment_track?.[0];

  if (!latest) {
    return null;
  }

  await updateShipment(orderId, {
    shipmentStatus: latest.current_status,
  });

  return latest;
}
