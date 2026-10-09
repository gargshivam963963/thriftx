import { detectDeliveryZone } from "@/lib/delivery";
import { PANIPAT_LOCAL_DELIVERY, SHIPPING_DEFAULTS } from "./constants";
import type { ShippingRate } from "./types";

export interface ShippingMethod {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  eta: string;
}

/**
 * Stable shipping-method identifiers.
 *
 * History: local and courier options previously shared the ids
 * "standard"/"express", so switching Panipat <-> Jaipur kept a stale
 * selection that passed id checks. These ids are now globally unique and
 * the backend validates by id (with legacy name fallback).
 */
export const SHIPPING_METHOD_IDS = {
  LOCAL: "local",
  COURIER_STANDARD: "courier-standard",
  COURIER_EXPRESS: "courier-express",
  // Legacy ids sent by older clients / persisted quotes.
  LEGACY_STANDARD: "standard",
  LEGACY_EXPRESS: "express",
} as const;

export type ShippingMethodId =
  | typeof SHIPPING_METHOD_IDS.LOCAL
  | typeof SHIPPING_METHOD_IDS.COURIER_STANDARD
  | typeof SHIPPING_METHOD_IDS.COURIER_EXPRESS;

export const SHIPPING_PROVIDERS = {
  LOCAL: "thriftx-local",
  COURIER: "shiprocket",
} as const;

export type ShippingProviderId =
  | typeof SHIPPING_PROVIDERS.LOCAL
  | typeof SHIPPING_PROVIDERS.COURIER;

export function isLocalDelivery(city?: string, pincode?: string): boolean {
  return Boolean(
    city && pincode && detectDeliveryZone(city, pincode) === "local",
  );
}

export function getCheckoutShippingOptions(
  city: string | undefined,
  pincode: string | undefined,
  orderSubtotal: number,
  rates: ShippingRate[],
): ShippingMethod[] {
  if (isLocalDelivery(city, pincode)) {
    const local = PANIPAT_LOCAL_DELIVERY;
    return [
      {
        id: SHIPPING_METHOD_IDS.LOCAL,
        name: local.enabled ? "Panipat Local Delivery" : "Local Delivery",
        subtitle: local.subtitle,
        price: local.price,
        eta: local.enabled ? local.etaLabel : "2–3 Hours",
      },
    ];
  }

  const freeShipping = orderSubtotal >= SHIPPING_DEFAULTS.freeShippingAmount;

  if (rates.length > 0) {
    const sorted = [...rates].sort((left, right) => left.amount - right.amount);
    const cheapest = sorted[0];
    const methods: ShippingMethod[] = [
      {
        id: SHIPPING_METHOD_IDS.COURIER_STANDARD,
        name: `${cheapest.courierName} — Standard`,
        subtitle: freeShipping
          ? "FREE on this order"
          : `Cheapest courier — ₹${cheapest.amount}`,
        price: freeShipping ? 0 : cheapest.amount,
        eta: `${cheapest.estimatedDays} Day${cheapest.estimatedDays !== 1 ? "s" : ""}`,
      },
    ];

    if (sorted.length > 1) {
      const faster = sorted[1];
      methods.push({
        id: SHIPPING_METHOD_IDS.COURIER_EXPRESS,
        name: `${faster.courierName} — Express`,
        subtitle: `Faster — ₹${faster.amount}`,
        price: faster.amount,
        eta: `${faster.estimatedDays} Day${faster.estimatedDays !== 1 ? "s" : ""}`,
      });
    }

    return methods;
  }

  return [];
}

/**
 * Resolve a client-supplied delivery-method value to a live option.
 *
 * Clients send the option NAME today (and older builds sent the legacy
 * "standard"/"express" ids). Matching is:
 *  1. exact id match (preferred — stable across address changes),
 *  2. exact name match (current clients),
 *  3. legacy id + zone fallback ("standard" -> local for Panipat,
 *     courier-standard otherwise) so old persisted quotes fail closed
 *     instead of charging the wrong fee.
 *
 * Returns undefined when the value is not valid for this address.
 */
export function resolveCheckoutShippingOption(
  city: string | undefined,
  pincode: string | undefined,
  orderSubtotal: number,
  rates: ShippingRate[],
  deliveryMethod: string,
): ShippingMethod | undefined {
  const options = getCheckoutShippingOptions(
    city,
    pincode,
    orderSubtotal,
    rates,
  );
  const wanted = deliveryMethod.trim();
  const exact = options.find(
    (option) => option.id === wanted || option.name === wanted,
  );
  if (exact) return exact;
  if (
    wanted === SHIPPING_METHOD_IDS.LEGACY_STANDARD ||
    wanted === SHIPPING_METHOD_IDS.LEGACY_EXPRESS
  ) {
    // Legacy clients: only accept the id when that zone has exactly one
    // option (Panipat local). Otherwise the method is ambiguous (which
    // courier?) and the shopper must reselect.
    if (options.length === 1) return options[0];
  }
  return undefined;
}
