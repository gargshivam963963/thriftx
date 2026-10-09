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
    throw new Error(
      "No courier is currently available for this delivery pincode.",
    );
  }

  /*
   * THRIFTX default courier strategy:
   *
   * 1. Lowest freight charge
   * 2. If price is equal, fastest ETA
   * 3. If price + ETA are equal, higher courier rating
   *
   * This keeps normal delivery economical without
   * blindly selecting an expensive express service.
   */
  return [...couriers].sort((a, b) => {
    if (a.freightCharge !== b.freightCharge) {
      return a.freightCharge - b.freightCharge;
    }

    const aDays = Number(a.estimatedDays);

    const bDays = Number(b.estimatedDays);

    if (Number.isFinite(aDays) && Number.isFinite(bDays) && aDays !== bDays) {
      return aDays - bDays;
    }

    return Number(b.rating || 0) - Number(a.rating || 0);
  })[0];
}
