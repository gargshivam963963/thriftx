import {
  databases,
  account,
  AppwriteID,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_ORDERS_COLLECTION_ID,
} from "@/lib/appwrite";
import type { Order, PaymentMethod } from "@/lib/types/order";

export interface OrderData {
  subtotal: number;
  shipping: number;
  total: number;
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
  return databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    documentId,
    shipment,
  );
}

export async function getOrder(documentId: string): Promise<Order> {
  const doc = await databases.getDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    documentId,
  );

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,

    orderId: doc.orderId,
    status: doc.status,

    subtotal: doc.subtotal,
    shipping: doc.shipping,
    total: doc.total,

    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,

    address: doc.address,
    city: doc.city,
    postalCode: doc.postalCode,
    country: doc.country,

    paymentMethod: doc.paymentMethod,

    paymentId: doc.paymentId,

    signature: doc.signature,

    deliveryMethod: doc.deliveryMethod,

    products: doc.products,

    shippingProvider: doc.shippingProvider,

    shipmentStatus: doc.shipmentStatus,

    pickupStatus: doc.pickupStatus,

    shipmentId: doc.shipmentId,

    trackingNumber: doc.trackingNumber,

    awbNumber: doc.awbNumber,

    courier: doc.courier,

    courierId: doc.courierId,

    estimatedDelivery: doc.estimatedDelivery,

    labelUrl: doc.labelUrl,

    invoiceUrl: doc.invoiceUrl,

    trackingUrl: doc.trackingUrl,

    pickupId: doc.pickupId,

    shippedAt: doc.shippedAt,

    deliveredAt: doc.deliveredAt,
  };
}

export async function createOrder(data: OrderData) {
  const user = await account.get();

  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    AppwriteID.unique(),
    {
      userId: user.$id,
      email: user.email,

      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,

      paymentMethod: data.paymentMethod,
      paymentId: data.paymentId ?? "",
      orderId: data.orderId ?? "",
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

export async function getUserOrders(): Promise<Order[]> {
  const user = await account.get();

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", user.$id),
      AppwriteQuery.orderDesc("$createdAt"),
    ],
  );

  return response.documents.map((doc) => ({
    $id: doc.$id,
    $createdAt: doc.$createdAt,

    orderId: doc.orderId,
    status: doc.status,

    subtotal: doc.subtotal,
    shipping: doc.shipping,
    total: doc.total,

    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,

    address: doc.address,
    city: doc.city,
    postalCode: doc.postalCode,
    country: doc.country,

    paymentMethod: doc.paymentMethod ?? "razorpay",
    paymentId: doc.paymentId,
    signature: doc.signature,

    deliveryMethod: doc.deliveryMethod,

    products: doc.products ?? "[]",
    shippingProvider: doc.shippingProvider,

    shipmentStatus: doc.shipmentStatus,

    pickupStatus: doc.pickupStatus,

    shipmentId: doc.shipmentId,

    trackingNumber: doc.trackingNumber,

    awbNumber: doc.awbNumber,

    courier: doc.courier,

    courierId: doc.courierId,

    estimatedDelivery: doc.estimatedDelivery,

    labelUrl: doc.labelUrl,

    invoiceUrl: doc.invoiceUrl,

    trackingUrl: doc.trackingUrl,

    pickupId: doc.pickupId,

    shippedAt: doc.shippedAt,

    deliveredAt: doc.deliveredAt,
  }));
}

export async function getOrderById(documentId: string) {
  return databases.getDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    documentId,
  );
}

export async function updateOrderStatus(documentId: string, status: string) {
  return databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ORDERS_COLLECTION_ID,
    documentId,
    {
      status,
    },
  );
}
