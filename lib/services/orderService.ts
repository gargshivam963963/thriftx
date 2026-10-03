import "server-only";

import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import type { Order } from "@/lib/types/order";

export interface OrderData {
  addressId?: string;
  subtotal: number;
  shipping: number;
  total: number;
  discount?: number;
  couponCode?: string;
  creditUsed?: number;
  paymentMethod: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryMethod: string;
  products: string;
  shippingProvider?: string;
  shipmentStatus?: string;
  pickupStatus?: string;
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

export interface UpdateShipmentData {
  shippingProvider?: string;
  shipmentStatus?: string;
  pickupStatus?: string;
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

export async function updateShipment(
  documentId: string,
  shipment: UpdateShipmentData,
) {
  if (!isDocumentStoreConfigured) return null;
  return documentStore.updateDocument("thriftx", "orders", documentId, {
    ...shipment,
  });
}

export async function getOrder(documentId: string): Promise<Order> {
  const doc = await documentStore.getDocument("thriftx", "orders", documentId);
  return doc as unknown as Order;
}

export async function createOrder(
  data: OrderData,
  user: { id: string; email: string },
) {
  if (!isDocumentStoreConfigured) return null;

  // For Razorpay orders, check for existing orders with same paymentId to prevent duplicates
  if (data.paymentId) {
    try {
      const existingOrders = await documentStore.listDocuments(
        "thriftx",
        "orders",
        [
          DocumentQuery.equal("userId", user.id),
          DocumentQuery.equal("paymentId", data.paymentId),
        ],
      );

      if (existingOrders.documents.length > 0) {
        console.warn(
          `Order creation blocked: duplicate paymentId ${data.paymentId} for user ${user.id}`,
        );
        return existingOrders.documents[0];
      }
    } catch (error) {
      console.error("Error checking for duplicate orders:", error);
    }
  }

  return documentStore.createDocument(
    "thriftx",
    "orders",
    DocumentID.unique(),
    {
      userId: user.id,
      email: user.email,
      subtotal: data.subtotal,
      shipping: data.shipping,
      discount: data.discount ?? 0,
      couponCode: data.couponCode ?? "",
      creditUsed: data.creditUsed ?? 0,
      total: data.total,
      paymentMethod: data.paymentMethod,
      paymentId: data.paymentId ?? "",
      orderId: data.orderId ?? `THRIFTX-${Date.now()}`,
      signature: data.signature ?? "",
      status: data.paymentMethod === "cod" ? "Pending (COD)" : "Pending",
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      deliveryMethod: data.deliveryMethod,
      products: data.products,
      shippingProvider: data.shippingProvider ?? "shiprocket",
      shipmentStatus: data.shipmentStatus ?? "pending",
      pickupStatus: data.pickupStatus ?? "pending",
      shipmentId: data.shipmentId ?? "",
      trackingNumber: data.trackingNumber ?? "",
      awbNumber: data.awbNumber ?? "",
      courier: data.courier ?? "",
      courierId: data.courierId ?? "",
      estimatedDelivery: data.estimatedDelivery ?? "",
      labelUrl: data.labelUrl ?? "",
      invoiceUrl: data.invoiceUrl ?? "",
      trackingUrl: data.trackingUrl ?? "",
      pickupId: data.pickupId ?? "",
      shippedAt: data.shippedAt ?? "",
      deliveredAt: data.deliveredAt ?? "",
    },
  );
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.orderDesc("$createdAt"),
  ]);

  return response.documents as unknown as Order[];
}

export async function getOrderById(documentId: string) {
  return documentStore.getDocument("thriftx", "orders", documentId);
}

export async function updateOrderStatus(documentId: string, status: string) {
  return documentStore.updateDocument("thriftx", "orders", documentId, {
    status,
  });
}
