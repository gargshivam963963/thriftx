import type { ShipmentStatus, ShippingMethod, ShippingProvider } from "./types";

/**
 * ------------------------------------------------------------------
 * THRIFTX Shipping Configuration
 * ------------------------------------------------------------------
 */

export const DEFAULT_SHIPPING_PROVIDER: ShippingProvider = "shiprocket";

export const DEFAULT_SHIPPING_METHOD: ShippingMethod = "standard";

export const SHIPPING_METHODS = {
  STANDARD: "standard" as const,
  EXPRESS: "express" as const,
  SAME_DAY: "same_day" as const,
};

export const SHIPMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  SHIPMENT_CREATED: "shipment_created",
  PICKUP_SCHEDULED: "pickup_scheduled",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  RTO: "rto",
} as const satisfies Record<string, ShipmentStatus>;

export const SHIPPING_ESTIMATES = {
  standard: {
    minDays: 4,
    maxDays: 6,
  },

  express: {
    minDays: 2,
    maxDays: 3,
  },

  same_day: {
    minDays: 0,
    maxDays: 0,
  },
};

export const SHIPPING_DEFAULTS = {
  currency: "INR",

  freeShippingAmount: 999,

  defaultWeight: 0.4, // kg

  defaultLength: 30, // cm

  defaultWidth: 25,

  defaultHeight: 5,

  insuranceEnabled: true,

  trackingEnabled: true,

  codEnabled: true,
};

export const PANIPAT_LOCAL_CITIES = ["panipat"];

export const SHIPPING_FEATURES = {
  allowCOD: true,

  allowInsurance: true,

  allowTracking: true,

  allowPickupScheduling: true,

  allowLabelGeneration: true,

  allowMultipleCouriers: true,
};

/**
 * Pickup address — used for Shiprocket label generation & courier rate calculation.
 * Values are read from environment variables so they can be changed per deployment
 * without touching code. Falls back to sensible defaults if not provided.
 */
export const PICKUP_ADDRESS = {
  name: process.env.SHIPROCKET_PICKUP_NAME || "ThriftX Warehouse",
  /**
   * Shiprocket "pickup_location" nickname registered in the Shiprocket
   * dashboard (Settings → Pickup & RTO addresses). This MUST exactly match
   * the nickname in Shiprocket, otherwise order creation is rejected.
   * Falls back to the warehouse name for backwards compatibility.
   */
  pickupLocation:
    process.env.SHIPROCKET_PICKUP_LOCATION ||
    process.env.SHIPROCKET_PICKUP_NAME ||
    "ThriftX Warehouse",
  address: process.env.SHIPROCKET_PICKUP_ADDRESS || "35B, Aggarsain Colony",
  city: process.env.SHIPROCKET_PICKUP_CITY || "Panipat",
  state: process.env.SHIPROCKET_PICKUP_STATE || "Haryana",
  country: process.env.SHIPROCKET_PICKUP_COUNTRY || "India",
  pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "132103",
  phone: process.env.SHIPROCKET_PICKUP_PHONE || "7056577903",
  email: process.env.SHIPROCKET_PICKUP_EMAIL || "gamerzgamingyt505@gmail.com",
};

/**
 * Panipat same-day delivery configuration.
 * All values are configurable via environment variables so the business
 * rules can be updated per deployment without a code change. Defaults
 * apply to a brand-new install only — Panipat-specific pins/fees must be
 * supplied via env before going live.
 */
export const PANIPAT_LOCAL_DELIVERY = {
  enabled:
    process.env.PANIPAT_LOCAL_DELIVERY_ENABLED !== "false" &&
    process.env.PANIPAT_LOCAL_CITIES_ENABLED !== "false",
  free: process.env.PANIPAT_LOCAL_DELIVERY_FREE === "true",
  price: Number(process.env.PANIPAT_LOCAL_DELIVERY_PRICE ?? "0"),
  etaLabel: process.env.PANIPAT_LOCAL_DELIVERY_ETA_LABEL ?? "2–3 Hours",
  etaLong:
    process.env.PANIPAT_LOCAL_DELIVERY_ETA_LONG ??
    "Same-day delivery in 2–3 hours",
  subtitle:
    process.env.PANIPAT_LOCAL_DELIVERY_SUBTITLE ?? "Panipat Local Delivery",
  window:
    process.env.PANIPAT_LOCAL_DELIVERY_WINDOW ??
    "Order before 2 PM for same-day dispatch",
};

/**
 * Panipat marketing copy — the ONE canonical source for every line of
 * "free delivery in Panipat" messaging across the storefront.
 *
 * Checkout, cart, shop, product, order-confirmation and SEO metadata all read
 * from here so the promise can never drift between surfaces. Change it once
 * here and the whole app updates.
 */
export const PANIPAT_DELIVERY_PROMO = {
  /** City we serve free local delivery to. */
  city: "Panipat",

  /** Short badge — pills, chips, banners. */
  badge: "FREE delivery in Panipat",

  /** Primary marketing headline — banners, hero slots, empty states. */
  headline: "Free same-day delivery across Panipat",

  /** One-sentence supporting line under the headline. */
  subheadline:
    "Order before 2 PM and get your THRIFTX order at your door in 2-3 hours.",

  /** Ordered benefit list — used in bullets under the headline. */
  benefits: [
    "FREE delivery — no minimum order value",
    "Delivered at your door in 2-3 hours",
    "Order before 2 PM for same-day dispatch",
    "Cash on delivery and online payment both accepted",
  ],

  /** CTA label for "you qualify / order now" links. */
  ctaLabel: "Shop Panipat delivery",

  /** SEO description fragment for indexable pages. */
  seoFragment:
    "THRIFTX offers FREE same-day delivery across Panipat, Haryana — order before 2 PM and receive your order at your doorstep in 2-3 hours, with cash on delivery available.",
} as const;

/**
 * Shipping rate presets (used when Shiprocket API is not configured).
 * These are realistic placeholder rates for India.
 */
export const FALLBACK_SHIPPING_RATES = {
  local: {
    standard: {
      price: 0,
      eta: "30–60 Minutes",
      name: "Same-Day Local Delivery",
    },
  },
  courier: {
    standard: { price: 49, eta: "4–6 Days", name: "Standard Delivery" },
    express: { price: 99, eta: "2–3 Days", name: "Express Delivery" },
  },
};
