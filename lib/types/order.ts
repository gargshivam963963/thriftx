export type PaymentMethod = "razorpay" | "cod";

export interface Order {
  $id: string;
  $createdAt: string;

  orderId: string;
  status: string;

  subtotal: number;
  shipping: number;
  total: number;

  firstName: string;
  lastName: string;
  phone: string;

  address: string;
  city: string;
  postalCode: string;
  country: string;

  paymentMethod: PaymentMethod;
  paymentId?: string;
  signature?: string;

  deliveryMethod: string;
  products: string;
}
