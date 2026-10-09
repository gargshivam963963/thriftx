/**
 * THRIFTX Delivery Strategy
 *
 * Panipat          → Same-Day Local Delivery (2–3 hours, FREE)
 * Outside Panipat  → 3-5 Business Days Courier (Shiprocket)
 */

const LOCAL_CITIES = new Set([
  "panipat",
  "panipat city",
  "panipat urban",
  "panipat rural",
  "panipat (haryana)",
  "aggarsain colony",
  "aggarsain colony panipat",
]);

/**
 * Panipat local-delivery PIN codes.
 *
 * Single canonical source for the local boundary — lib/delivery.ts and
 * lib/shipping/checkout-options.ts both resolve through here, so the
 * storefront, checkout quote, and order creation can never disagree.
 *
 * Override with env PANIPAT_LOCAL_PINCODES="132103,132104,..." (comma
 * separated). Extra env-only pins are UNIONED with the built-in list, so a
 * missing env can never accidentally shrink coverage. Report the effective
 * list in the final summary — do not silently guess new areas.
 */
const BUILT_IN_LOCAL_PINCODES = ["132103", "132101", "132102", "132104"];

function readExtraLocalPincodes(): string[] {
  const raw = process.env.PANIPAT_LOCAL_PINCODES ?? "";
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^\d{6}$/.test(part));
}

export const LOCAL_PINCODES: ReadonlySet<string> = new Set([
  ...BUILT_IN_LOCAL_PINCODES,
  ...readExtraLocalPincodes(),
]);

export type DeliveryZone = "local" | "courier";

export interface DeliveryInfo {
  zone: DeliveryZone;
  label: string;
  eta: string;
  icon: string;
  description: string;
  price: number;
  free: boolean;
}

export function detectDeliveryZone(
  city: string,
  pincode?: string,
): DeliveryZone {
  const normalizedCity = city.trim().toLowerCase();
  const normalizedPincode = (pincode ?? "").trim();
  // Explicit PIN match always wins — covers "Panipat / 132103" plus any
  // address whose city string is a locality ("Shiv Nagar, Panipat").
  if (normalizedPincode && LOCAL_PINCODES.has(normalizedPincode)) {
    return "local";
  }
  // Fall back to the city allow-list when no pincode is known yet
  // (address form before PIN entry, marketing surfaces).
  if (
    !normalizedPincode &&
    (LOCAL_CITIES.has(normalizedCity) || normalizedCity.includes("panipat"))
  ) {
    return "local";
  }
  // PIN present but not local, or a non-Panipat city: courier.
  // This keeps Jaipur/302039 on Shiprocket even if a stale local method
  // is still selected client-side (server then rejects it — see quote).
  return "courier";
}

export function isLocalDelivery(city: string, pincode?: string): boolean {
  return detectDeliveryZone(city, pincode) === "local";
}

export function getDeliveryInfo(city: string, pincode?: string): DeliveryInfo {
  const zone = detectDeliveryZone(city, pincode);

  if (zone === "local") {
    return {
      zone: "local",
      label: "Same-Day Delivery",
      eta: "2–3 Hours",
      icon: "⚡",
      description:
        "FREE same-day delivery in Panipat within 2–3 hours. Order before 2 PM for same-day dispatch.",
      price: 0,
      free: true,
    };
  }

  return {
    zone: "courier",
    label: "3-5 Business Days",
    eta: "3–5 Days",
    icon: "📦",
    description:
      "Shipped via trusted courier partner. Tracking ID will be shared once dispatched.",
    price: 0,
    free: false,
  };
}

export function formatDeliveryTimeline(zone: DeliveryZone): {
  label: string;
  steps: { title: string; subtitle: string; completed?: boolean }[];
} {
  if (zone === "local") {
    return {
      label: "Same-Day Delivery (2–3 Hours)",
      steps: [
        {
          title: "Order Confirmed",
          subtitle: "Your order is placed",
          completed: true,
        },
        { title: "Item Packed", subtitle: "Being prepared for delivery" },
        { title: "Out for Delivery", subtitle: "On its way to you" },
        { title: "Delivered", subtitle: "Enjoy your thrift piece!" },
      ],
    };
  }

  return {
    label: "3-5 Business Days",
    steps: [
      {
        title: "Order Confirmed",
        subtitle: "Your order is placed",
        completed: true,
      },
      { title: "Item Packed", subtitle: "Quality checked & packed" },
      { title: "Shipped", subtitle: "Dispatched via courier" },
      { title: "Out for Delivery", subtitle: "Reaching your city" },
      { title: "Delivered", subtitle: "Enjoy your thrift piece!" },
    ],
  };
}
