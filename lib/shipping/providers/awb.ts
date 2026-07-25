import { shiprocketFetch } from "./client";

interface AssignAwbResponse {
  response?: {
    data?: {
      awb_code: string;
      courier_company_id: number;
      shipment_id: number;
    };
  };
}

export async function assignAwb(shipmentId: string, courierCompanyId: number) {
  return shiprocketFetch<AssignAwbResponse>("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: Number(shipmentId),
      courier_id: courierCompanyId,
    }),
  });
}
