import type {
  Shipment,
  ShippingRate,
  ShipmentStatus,
  PickupDetails,
} from "../types";

export interface CreateShipmentPayload {
  orderId: string;

  customerName: string;

  phone: string;

  email?: string;

  address: string;

  city: string;

  state: string;

  country: string;

  pincode: string;

  weight: number;

  length: number;

  width: number;

  height: number;

  amount: number;

  cod: boolean;

  items?: {
    id?: string;
    title?: string;
    price?: number | string;
    quantity?: number;
  }[];
}

export interface ShipmentResult {
  success: boolean;

  message?: string;

  code?: string;

  details?: unknown;

  shipment?: Shipment;

  shipmentId?: string;

  orderId?: string;

  awbCode?: string;

  courierName?: string;

  courierCompanyId?: number;

  trackingNumber?: string;

  trackingUrl?: string;

  labelUrl?: string;

  invoiceUrl?: string;

  estimatedDelivery?: string;
}

export interface PickupResult {
  success: boolean;

  pickup?: PickupDetails;

  message?: string;

  code?: string;

  details?: unknown;
}

export interface TrackingResult {
  success: boolean;

  status?: ShipmentStatus;

  tracking?: Shipment["tracking"];

  message?: string;
}

export interface ShippingProvider {
  /**
   * Provider name
   */
  readonly provider: string;

  /**
   * Create shipment
   */
  createShipment(payload: CreateShipmentPayload): Promise<ShipmentResult>;

  /**
   * Cancel shipment
   */
  cancelShipment(shipmentId: string): Promise<boolean>;

  /**
   * Schedule pickup
   */
  schedulePickup(shipmentId: string): Promise<PickupResult>;

  /**
   * Get tracking details
   */
  getTracking(trackingNumber: string): Promise<TrackingResult>;

  /**
   * Generate shipping label
   */
  generateLabel(shipmentId: string): Promise<string | null>;

  /**
   * Fetch shipping rates
   */
  getShippingRates(pincode: string, weight: number): Promise<ShippingRate[]>;
}
