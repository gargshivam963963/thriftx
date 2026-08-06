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

  freeShippingAmount: 999, // Free shipping on orders above ₹999

  defaultWeight: 0.5, // kg

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
 * Used to power the free + 2–3 hour local delivery experience.
 */
export const PANIPAT_LOCAL_DELIVERY = {
  enabled: true,
  free: true,
  price: 0,
  etaLabel: "2–3 Hours",
  etaLong: "Same-day delivery in 2–3 hours",
  subtitle: "FREE delivery in Panipat",
  window: "Order before 2 PM for same-day dispatch",
};

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
