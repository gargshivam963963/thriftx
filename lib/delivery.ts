/**
 * THRIFTX Delivery Strategy
 *
 * Panipat          → Same-Day Local Delivery (local)
 * Outside Panipat  → 3-5 Business Days Courier (courier)
 */

const LOCAL_CITIES = new Set([
  "panipat",
  "panipat city",
  "panipat urban",
  "panipat rural",
]);

const LOCAL_PINCODE_PREFIXES = [
  "132103",
  "132104",
  "132105",
  "132106",
  "132107",
  "132108",
  "132109",
  "132110",
  "132111",
  "132112",
  "132113",
  "132114",
  "132115",
  "132116",
  "132117",
  "132118",
  "132119",
  "132120",
  "132121",
  "132122",
  "132123",
  "132124",
  "132125",
  "132126",
  "132127",
  "132128",
  "132129",
  "132130",
  "132131",
  "132132",
  "132133",
  "132134",
  "132135",
  "132136",
  "132137",
  "132138",
  "132139",
  "132140",
  "132141",
  "132142",
  "132143",
  "132144",
  "132145",
];

export type DeliveryZone = "local" | "courier";

export interface DeliveryInfo {
  zone: DeliveryZone;
  label: string;
  eta: string;
  icon: string;
  description: string;
}

export function detectDeliveryZone(
  city: string,
  pincode?: string,
): DeliveryZone {
  const normalizedCity = city.trim().toLowerCase();
  if (LOCAL_CITIES.has(normalizedCity)) return "local";

  if (pincode) {
    const normalizedPincode = pincode.trim();
    const match = LOCAL_PINCODE_PREFIXES.some((prefix) =>
      normalizedPincode.startsWith(prefix),
    );
    if (match) return "local";
  }

  return "courier";
}

export function getDeliveryInfo(city: string, pincode?: string): DeliveryInfo {
  const zone = detectDeliveryZone(city, pincode);

  if (zone === "local") {
    return {
      zone: "local",
      label: "Same-Day Delivery",
      eta: "Today",
      icon: "⚡",
      description:
        "We deliver locally in Panipat on the same day. Order before 2 PM for same-day dispatch.",
    };
  }

  return {
    zone: "courier",
    label: "3-5 Business Days",
    eta: "3–5 Days",
    icon: "📦",
    description:
      "Shipped via trusted courier partner. Tracking ID will be shared once dispatched.",
  };
}

export function formatDeliveryTimeline(zone: DeliveryZone): {
  label: string;
  steps: { title: string; subtitle: string; completed?: boolean }[];
} {
  if (zone === "local") {
    return {
      label: "Same-Day Delivery",
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
