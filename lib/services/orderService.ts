import "server-only";

import { createHash } from "node:crypto";
import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Order } from "@/lib/types/order";
import {
  claimCheckoutInventory,
  InventoryUnavailableError,
} from "./inventory.server";

export class OrderInventoryConflictError extends Error {
  constructor() {
    super("One or more items in your cart have just been sold.");
    this.name = "OrderInventoryConflictError";
  }
}

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
  idempotencyKey?: string;
  reservationId?: string;
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
  if (!isDocumentStoreConfigured || !prisma) return null;

  if (data.paymentId) {
    const existingOrder = await getOrderByPaymentId(user.id, data.paymentId);
    if (existingOrder) return existingOrder;
  }

  const documentId = data.paymentId
    ? `payment-${createHash("sha256").update(data.paymentId).digest("hex")}`
    : data.idempotencyKey
      ? `cod-${createHash("sha256")
          .update(`${user.id}:${data.idempotencyKey}`)
          .digest("hex")}`
      : DocumentID.unique();

  let productIds: string[];
  try {
    const parsed: unknown = JSON.parse(data.products);
    if (!Array.isArray(parsed)) throw new Error("Invalid product snapshot");
    productIds = parsed.map((item: unknown) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("id" in item) ||
        typeof item.id !== "string" ||
        !("quantity" in item) ||
        item.quantity !== 1
      ) {
        throw new Error("Invalid product snapshot");
      }
      return item.id;
    });
  } catch {
    throw new OrderInventoryConflictError();
  }

  if (
    productIds.length === 0 ||
    new Set(productIds).size !== productIds.length
  ) {
    throw new OrderInventoryConflictError();
  }

  const payload = {
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
      orderId:
        data.orderId ??
        `THRIFTX-${documentId.slice(-12).toUpperCase()}`,
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
    } satisfies Record<string, Prisma.InputJsonValue>;

  try {
    return await prisma.$transaction(async (transaction) => {
      const existing = await transaction.storedDocument.findUnique({
        where: {
          collectionKey_id: {
            collectionKey: "orders",
            id: documentId,
          },
        },
      });
      if (existing) {
        const existingData = existing.data as Record<string, unknown>;
        if (existingData.userId !== user.id) {
          throw new Error("Order idempotency key belongs to another user");
        }
        return {
          ...existingData,
          $id: existing.id,
          $createdAt: existing.createdAt.toISOString(),
          $updatedAt: existing.updatedAt.toISOString(),
        };
      }

      if (data.paymentMethod === "razorpay" && !data.reservationId) {
        throw new OrderInventoryConflictError();
      }
      try {
        await claimCheckoutInventory(
          transaction,
          user.id,
          productIds,
          data.paymentMethod === "razorpay" ? data.reservationId : undefined,
        );
      } catch (error) {
        if (error instanceof InventoryUnavailableError) {
          throw new OrderInventoryConflictError();
        }
        throw error;
      }

      const created = await transaction.storedDocument.create({
        data: {
          collectionKey: "orders",
          id: documentId,
          data: payload,
        },
      });
      return {
        ...payload,
        $id: created.id,
        $createdAt: created.createdAt.toISOString(),
        $updatedAt: created.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    const existing = await documentStore
      .getDocument("thriftx", "orders", documentId)
      .catch(() => null);
    if (existing && existing.userId === user.id) return existing;
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.orderDesc("$createdAt"),
  ]);

  return response.documents as unknown as Order[];
}

export async function getOrderByPaymentId(userId: string, paymentId: string) {
  const response = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.equal("paymentId", paymentId),
    DocumentQuery.limit(1),
  ]);

  return response.documents[0] ?? null;
}

export async function getOrderById(documentId: string) {
  return documentStore.getDocument("thriftx", "orders", documentId);
}

export async function updateOrderStatus(documentId: string, status: string) {
  return documentStore.updateDocument("thriftx", "orders", documentId, {
    status,
  });
}
