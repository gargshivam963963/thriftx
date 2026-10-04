export type PaymentMethod = "razorpay" | "cod";

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

export type ReturnStatus =
  | "none"
  | "requested"
  | "approved"
  | "rejected"
  | "item_received"
  | "refunded";

export type RefundStatus =
  | "none"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Order {
  $id: string;
  $createdAt: string;

  orderId: string;
  status: string;

  email?: string;

  subtotal: number;
  shipping: number;
  discount?: number;
  couponCode?: string;
  creditUsed?: number;
  total: number;

  firstName: string;
  lastName: string;
  phone: string;

  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;

  paymentMethod: PaymentMethod;

  paymentId?: string;

  signature?: string;

  deliveryMethod: string;

  products: string;

  // --------------------------
  // Returns & Refunds
  // --------------------------

  returnStatus?: ReturnStatus;

  returnReason?: string;

  returnRequestedAt?: string;

  returnAdminNotes?: string;

  refundStatus?: RefundStatus;

  refundAmount?: number;

  refundId?: string;

  refundedAt?: string;

  // --------------------------
  // Shipping
  // --------------------------

  shippingProvider?: string;

  shipmentStatus?: ShipmentStatus;

  pickupStatus?: PickupStatus;

  shipmentId?: string;

  trackingNumber?: string;

  awbNumber?: string;

  courier?: string;

  courierId?: string;

  estimatedDelivery?: string;

  labelUrl?: string;

  invoiceUrl?: string;

  trackingUrl?: string;

  pickupId?: string;

  shippedAt?: string;

  deliveredAt?: string;
}
