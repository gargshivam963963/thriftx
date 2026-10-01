import "server-only";

import { unstable_cache } from "next/cache";
import { shipmentService } from "./services/shipment";
import { SHIPPING_DEFAULTS } from "./constants";

const loadShippingRates = unstable_cache(
  (pincode: string, weight: number) =>
    shipmentService.getShippingRates(pincode, weight),
  ["shipping-rates-v1"],
  { revalidate: 60, tags: ["shipping-rates"] },
);

export function getCachedShippingRates(
  pincode: string,
  weight = SHIPPING_DEFAULTS.defaultWeight,
) {
  return loadShippingRates(pincode, weight);
}
