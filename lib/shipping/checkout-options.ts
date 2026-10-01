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
    return [
      {
        id: "standard",
        name: "Panipat Same-Day Delivery",
        subtitle: PANIPAT_LOCAL_DELIVERY.subtitle,
        price: PANIPAT_LOCAL_DELIVERY.price,
        eta: PANIPAT_LOCAL_DELIVERY.etaLabel,
      },
    ];
  }

  const freeShipping = orderSubtotal >= SHIPPING_DEFAULTS.freeShippingAmount;

  if (rates.length > 0) {
    const sorted = [...rates].sort((left, right) => left.amount - right.amount);
    const cheapest = sorted[0];
    const methods: ShippingMethod[] = [
      {
        id: "standard",
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
        id: "express",
        name: `${faster.courierName} — Express`,
        subtitle: `Faster — ₹${faster.amount}`,
        price: faster.amount,
        eta: `${faster.estimatedDays} Day${faster.estimatedDays !== 1 ? "s" : ""}`,
      });
    }

    return methods;
  }

  return [
    {
      id: "standard",
      name: "Standard Delivery",
      subtitle: freeShipping ? "FREE on this order" : "Best Value",
      price: freeShipping ? 0 : 49,
      eta: "4–6 Days",
    },
    {
      id: "express",
      name: "Express Delivery",
      subtitle: "Faster Shipping",
      price: 99,
      eta: "2–3 Days",
    },
  ];
}
