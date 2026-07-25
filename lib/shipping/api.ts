import type { CreateShipmentPayload } from "./providers/base";
import type { ShipmentResult } from "./providers/base";

export async function createShipment(
  payload: CreateShipmentPayload,
): Promise<ShipmentResult> {
  const response = await fetch("/api/shipping/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}
