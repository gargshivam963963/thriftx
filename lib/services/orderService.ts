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
import type {
  Order,
  PaymentMethod,
  ShipmentStatus,
  PickupStatus,
} from "@/lib/types/order";
import {
  claimCheckoutInventory,
  restoreOrderInventory,
  InventoryUnavailableError,
} from "./inventory.server";
import { revalidatePath } from "next/cache";
import {
  notifyOrderChanges,
  notifyTrackingReady,
  type OrderRef,
} from "@/lib/notifications/orderEvents";
import {
  SHIPPING_PROVIDERS,
  SHIPPING_METHOD_IDS,
} from "@/lib/shipping/checkout-options";

async function safeNotify(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error("Order notification failed:", error);
  }
}

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
  const updated = await documentStore.updateDocument(
    "thriftx",
    "orders",
    documentId,
    { ...shipment },
  );
  if (shipment.trackingNumber) {
    await safeNotify(() =>
      notifyTrackingReady(
        updated as unknown as OrderRef,
        String(shipment.trackingNumber),
      ),
    );
  }
  return updated;
}

export async function getOrder(documentId: string): Promise<Order> {
  const doc = await documentStore.getDocument("thriftx", "orders", documentId);
  if (!doc) throw new Error("Document not found");
  return toOrder(doc);
}

export async function createOrder(
  data: OrderData,
  user: { id: string; email: string },
): Promise<Order | null> {
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
    paymentMethod: data.paymentMethod as PaymentMethod,
    paymentId: data.paymentId ?? "",
    orderId: data.orderId ?? `THRIFTX-${documentId.slice(-12).toUpperCase()}`,
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
    shippingProvider: data.shippingProvider ?? SHIPPING_PROVIDERS.LOCAL,
    shipmentStatus: isShipmentStatus(data.shipmentStatus)
      ? data.shipmentStatus
      : "pending",
    pickupStatus: isPickupStatus(data.pickupStatus)
      ? data.pickupStatus
      : "pending",
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

        const shipmentStatus = isShipmentStatus(existingData.shipmentStatus)
          ? existingData.shipmentStatus
          : undefined;

        const pickupStatus = isPickupStatus(existingData.pickupStatus)
          ? existingData.pickupStatus
          : undefined;
        const {
          shipmentStatus: _shipment,
          pickupStatus: _pickup,
          ...rest
        } = existingData;
        return {
          ...rest,
          shipmentStatus: shipmentStatus as ShipmentStatus | undefined,
          pickupStatus: pickupStatus as PickupStatus | undefined,
          $id: existing.id,
          $createdAt: existing.createdAt.toISOString(),
          $updatedAt: existing.updatedAt.toISOString(),
        } as unknown as Order;
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
      return toOrder({
        ...payload,
        $id: created.id,
        $createdAt: created.createdAt.toISOString(),
        $updatedAt: created.updatedAt.toISOString(),
      });
    });
  } catch (error) {
    const existing = await documentStore
      .getDocument("thriftx", "orders", documentId)
      .catch(() => null);

    if (existing && existing.userId === user.id) {
      return toOrder(existing);
    }

    throw error;
  }
}

const SHIPMENT_STATUSES: readonly ShipmentStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipment_created",
  "pickup_scheduled",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "rto",
];

const PICKUP_STATUSES: readonly PickupStatus[] = [
  "pending",
  "scheduled",
  "picked_up",
  "failed",
];

function isShipmentStatus(value: unknown): value is ShipmentStatus {
  return typeof value === "string" &&
    SHIPMENT_STATUSES.includes(value as ShipmentStatus);
}

function isPickupStatus(value: unknown): value is PickupStatus {
  return typeof value === "string" &&
    PICKUP_STATUSES.includes(value as PickupStatus);
}

function toOrder(doc: unknown): Order {
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    throw new Error("Invalid order document");
  }

  const record = doc as Record<string, unknown>;
  const shipmentStatus = isShipmentStatus(record.shipmentStatus)
    ? record.shipmentStatus
    : undefined;
  const pickupStatus = isPickupStatus(record.pickupStatus)
    ? record.pickupStatus
    : undefined;

  return {
    ...record,
    ...(shipmentStatus ? { shipmentStatus } : { shipmentStatus: undefined }),
    ...(pickupStatus ? { pickupStatus } : { pickupStatus: undefined }),
  } as unknown as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.orderDesc("$createdAt"),
  ]);

  return response.documents.map((doc) => toOrder(doc));
}

export async function getOrderByPaymentId(
  userId: string,
  paymentId: string,
): Promise<Order | null> {
  const response = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.equal("paymentId", paymentId),
    DocumentQuery.limit(1),
  ]);
  const doc = response.documents[0];
  return doc ? toOrder(doc) : null;
}

export async function getOrderById(documentId: string): Promise<Order | null> {
  const doc = await documentStore.getDocument("thriftx", "orders", documentId);
  if (!doc) return null;
  return toOrder(doc);
}

export async function getUserOrder(
  userId: string,
  documentId: string,
): Promise<Order | null> {
  if (!prisma || !isDocumentStoreConfigured) {
    throw new Error("Order storage is not configured.");
  }

  const document = await prisma.storedDocument.findUnique({
    where: {
      collectionKey_id: {
        collectionKey: "orders",
        id: documentId,
      },
    },
  });
  if (
    !document ||
    typeof document.data !== "object" ||
    document.data === null ||
    Array.isArray(document.data)
  ) {
    return null;
  }

  const payload = document.data as Record<string, unknown>;
  if (payload.userId !== userId) return null;

  return toOrder({
    ...payload,
    $id: document.id,
    $createdAt: document.createdAt.toISOString(),
    $updatedAt: document.updatedAt.toISOString(),
  });
}

export async function updateOrderStatus(documentId: string, status: string) {
  const existing = await getOrderById(documentId);
  const updated = await documentStore.updateDocument(
    "thriftx",
    "orders",
    documentId,
    {
      status,
    },
  );

  if (existing) {
    await safeNotify(() =>
      notifyOrderChanges(existing as unknown as OrderRef, { status }),
    );
  }

  if (status === "Cancelled" && existing?.products) {
    try {
      const items = JSON.parse(existing.products as string);
      if (Array.isArray(items)) {
        const productIds = items
          .map((i: { id?: string }) => i.id)
          .filter((id): id is string => typeof id === "string" && Boolean(id));
        if (productIds.length > 0) {
          await restoreOrderInventory(productIds);
          revalidatePath("/product/[slug]", "page");
          revalidatePath("/shop", "page");
        }
      }
    } catch (e) {
      console.error("Failed to restore inventory on order cancellation:", e);
    }
  }

  return updated;
}

export async function cancelUserOrder(
  userId: string,
  documentId: string,
  reason = "Customer cancelled",
): Promise<Order> {
  const order = await getUserOrder(userId, documentId);
  if (!order) {
    throw new Error("Order not found");
  }

  const cancellableStatuses = ["Pending", "Pending (COD)", "Processing"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error(
      `Orders in '${order.status}' status cannot be cancelled directly. Please contact support.`,
    );
  }

  const updatedDoc = await documentStore.updateDocument(
    "thriftx",
    "orders",
    documentId,
    {
      status: "Cancelled",
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
      refundStatus: order.paymentMethod === "razorpay" ? "pending" : "none",
    },
  );

  await safeNotify(() =>
    notifyOrderChanges(order as unknown as OrderRef, { status: "Cancelled" }),
  );

  // Restore inventory
  try {
    const items = JSON.parse(order.products);
    if (Array.isArray(items)) {
      const productIds = items
        .map((i: { id?: string }) => i.id)
        .filter((id): id is string => typeof id === "string" && Boolean(id));
      if (productIds.length > 0) {
        await restoreOrderInventory(productIds);
        revalidatePath("/product/[slug]", "page");
        revalidatePath("/shop", "page");
      }
    }
  } catch (e) {
    console.error(
      "Failed to restore inventory during customer cancellation:",
      e,
    );
  }

  return updatedDoc as unknown as Order;
}

export async function requestOrderReturn(
  userId: string,
  documentId: string,
  reason: string,
): Promise<Order> {
  const order = await getUserOrder(userId, documentId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "Delivered") {
    throw new Error("Returns can only be requested for delivered orders.");
  }

  if (order.returnStatus && order.returnStatus !== "none") {
    throw new Error(
      `A return has already been ${order.returnStatus} for this order.`,
    );
  }

  // 7-day return policy check
  const orderDate = new Date(order.deliveredAt || order.$createdAt);
  const now = new Date();
  const daysDiff =
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 7) {
    throw new Error(
      "Return window has closed. Returns must be requested within 7 days of delivery.",
    );
  }

  const updatedDoc = await documentStore.updateDocument(
    "thriftx",
    "orders",
    documentId,
    {
      returnStatus: "requested",
      returnReason: reason.trim(),
      returnRequestedAt: new Date().toISOString(),
      refundStatus: "pending",
    },
  );

  await safeNotify(() =>
    notifyOrderChanges(order as unknown as OrderRef, {
      returnStatus: "requested",
    }),
  );

  return updatedDoc as unknown as Order;
}
