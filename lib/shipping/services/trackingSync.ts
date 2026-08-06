import { getTracking } from "../providers/tracking";
import { updateShipment } from "@/lib/services/orderService";

export async function syncTracking(orderId: string, awb: string) {
  const response = await getTracking(awb);

  const track = response.tracking_data?.shipment_track ?? [];
  const latest = track[0];

  if (!latest) {
    return null;
  }

  await updateShipment(orderId, {
    shipmentStatus: latest.current_status,
  });

  // Return the full tracking array (newest first) so the UI can render a timeline.
  return track;
}
