/**
 * THRIFTX Shipping Types
 * -----------------------------------------
 * Shared types for shipping, fulfillment,
 * tracking and courier integrations.
 */

export type ShippingProvider =
  | "shiprocket"
  | "manual"
  | "delhivery"
  | "bluedart"
  | "xpressbees";

export type ShippingMethod = "standard" | "express" | "same_day";

export type ShipmentStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipment_created"
  | "pickup_scheduled"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "rto";

export type PickupStatus = "pending" | "scheduled" | "picked_up" | "failed";

export interface Courier {
  id: string;
  name: string;
  provider: ShippingProvider;
  logo?: string;
}

export interface ShippingRate {
  courierId: string;
  courierName: string;

  method: ShippingMethod;

  amount: number;

  estimatedDays: number;

  estimatedDelivery?: string;

  codAvailable: boolean;

  trackingAvailable: boolean;
}

export interface PickupDetails {
  pickupId?: string;

  scheduledAt?: string;

  status: PickupStatus;
}

export interface TrackingEvent {
  status: ShipmentStatus;

  description: string;

  location?: string;

  timestamp: string;
}

export interface Shipment {
  shipmentId?: string;

  provider: ShippingProvider;

  courier: Courier;

  method: ShippingMethod;

  status: ShipmentStatus;

  trackingNumber?: string;

  awbNumber?: string;

  labelUrl?: string;

  invoiceUrl?: string;

  estimatedDelivery?: string;

  shippingCharge: number;

  pickup: PickupDetails;

  tracking: TrackingEvent[];

  createdAt: string;

  updatedAt: string;
}
