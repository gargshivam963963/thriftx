import { shiprocketFetch } from "./client";

interface PickupResponse {
  pickup_status?: number;
  response?: {
    pickup_scheduled_date?: string;
    pickup_token_number?: string;
    message?: string;
  };
}

export async function schedulePickup(shipmentId: string) {
  return shiprocketFetch<PickupResponse>("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: [Number(shipmentId)],
    }),
  });
}
