import type { CreateShipmentPayload } from "./providers/base";
import type { ShipmentResult } from "./providers/base";
import type { ShippingRate } from "./types";

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

export async function getShippingRates(
  pincode: string,
  weight?: number,
): Promise<{ rates: ShippingRate[] }> {
  const params = new URLSearchParams({ pincode });
  if (weight) params.set("weight", String(weight));

  const response = await fetch(`/api/shipping/rates?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return response.json();
}
