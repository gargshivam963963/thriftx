import {
  databases,
  account,
  AppwriteID,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_ORDERS_COLLECTION_ID,
} from "@/lib/appwrite";
import type { Order } from "@/lib/types/order";

export interface OrderData {
  subtotal: number;
  shipping: number;
  total: number;

  paymentId: string;
  orderId: string;
  signature: string;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;

  deliveryMethod: string;

  products: string;
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

      paymentId: data.paymentId,
      orderId: data.orderId,
      signature: data.signature,

      status: "Pending",

      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,

      deliveryMethod: data.deliveryMethod,

      products: data.products,
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

    paymentId: doc.paymentId,
    signature: doc.signature,

    deliveryMethod: doc.deliveryMethod,

    products: doc.products ?? "[]",
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
