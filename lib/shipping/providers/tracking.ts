import { shiprocketFetch } from "./client";

interface TrackingResponse {
  tracking_data?: {
    shipment_track?: Array<{
      current_status: string;
      shipment_status: string;
      shipment_status_id: number;
      date: string;
      activity: string;
      location: string;
    }>;
  };
}

export async function getTracking(awb: string): Promise<TrackingResponse> {
  return shiprocketFetch(`/courier/track/awb/${awb}`);
}
