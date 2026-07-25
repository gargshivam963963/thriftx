import { assignAwb } from "../providers/awb";

export async function generateAwb(
  shipmentId: string,
  courierCompanyId: number,
) {
  const response = await assignAwb(shipmentId, courierCompanyId);

  return response.response?.data;
}
