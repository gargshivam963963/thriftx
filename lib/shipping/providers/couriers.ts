import { shiprocketFetch } from "./client";

export interface AvailableCourier {
  courierCompanyId: number;
  courierName: string;
  freightCharge: number;
  codCharge: number;
  estimatedDays: string;
  rating: number;
}

interface CourierResponse {
  data?: {
    available_courier_companies?: Array<{
      courier_company_id: number;
      courier_name: string;
      freight_charge: number;
      cod_charges: number;
      estimated_delivery_days: string;
      rating: number;
    }>;
  };
}

export async function getAvailableCouriers(
  pickupPincode: string,
  deliveryPincode: string,
  cod: boolean,
  weight: number,
) {
  const response = await shiprocketFetch<CourierResponse>(
    `/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&cod=${cod ? 1 : 0}&weight=${weight}`,
  );

  const couriers = response.data?.available_courier_companies ?? [];

  return couriers.map((courier) => ({
    courierCompanyId: courier.courier_company_id,
    courierName: courier.courier_name,
    freightCharge: courier.freight_charge,
    codCharge: courier.cod_charges,
    estimatedDays: courier.estimated_delivery_days,
    rating: courier.rating,
  }));
}
