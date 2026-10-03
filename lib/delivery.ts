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

const LOCAL_PINCODES = new Set(["132103", "132104"]);

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
  const cityMatches = LOCAL_CITIES.has(normalizedCity);
  if (!pincode) return cityMatches ? "local" : "courier";
  return cityMatches && LOCAL_PINCODES.has(pincode.trim())
    ? "local"
    : "courier";
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
