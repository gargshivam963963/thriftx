import { getAvailableCouriers } from "../providers/couriers";

export async function getBestCourier(
  pickupPincode: string,
  deliveryPincode: string,
  cod: boolean,
  weight: number,
) {
  const couriers = await getAvailableCouriers(
    pickupPincode,
    deliveryPincode,
    cod,
    weight,
  );

  if (!couriers.length) {
    throw new Error("No courier available.");
  }

  return couriers.sort((a, b) => {
    if (a.freightCharge !== b.freightCharge) {
      return a.freightCharge - b.freightCharge;
    }

    return Number(a.estimatedDays) - Number(b.estimatedDays);
  })[0];
}
