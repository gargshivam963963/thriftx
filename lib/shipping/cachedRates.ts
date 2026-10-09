import "server-only";

import { unstable_cache } from "next/cache";
import { shipmentService } from "./services/shipment";
import { SHIPPING_DEFAULTS } from "./constants";

// NOTE: unstable_cache keys on the function ARGUMENTS (pincode, weight)
// in addition to the static key-parts below, so each destination caches
// independently for 60s. Verified — no cross-pincode leakage here. The
// stale-quote bug fixed in this release lives client-side (checkout page
// reused the previous address's quote); see app/checkout/page.tsx.
const loadShippingRates = unstable_cache(
  (pincode: string, weight: number, cod: boolean) =>
    shipmentService.getShippingRates(pincode, weight, cod),
  ["shipping-rates-v2"],
  { revalidate: 60, tags: ["shipping-rates"] },
);

export function getCachedShippingRates(
  pincode: string,
  weight = SHIPPING_DEFAULTS.defaultWeight,
  cod = false,
) {
  return loadShippingRates(pincode, weight, cod);
}
