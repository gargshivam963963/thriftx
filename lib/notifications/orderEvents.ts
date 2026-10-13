import "server-only";

import { createNotification, notifyAdmins } from "./server";

export interface OrderRef {
  $id: string;
  userId?: string;
  orderId?: string;
  status?: string;
  returnStatus?: string;
  refundStatus?: string;
}

/** Short human-friendly label: `#A1B2C3` — never a raw `#order_xxx` id. */
export function shortOrderLabel(order: OrderRef): string {
  const raw = (order.orderId || order.$id || "").replace(/^order_/i, "");
  const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!clean) return "#ORDER";
  return `#${clean.slice(-6)}`;
}

const label = shortOrderLabel;
const href = (order: OrderRef) => `/orders/${order.$id}`;

const STATUS_COPY: Record<
  string,
  { type: Parameters<typeof createNotification>[0]["type"]; title: string; text: string }
> = {
  Processing: {
    type: "order_processing",
    title: "We're preparing your order",
    text: "is confirmed and being packed.",
  },
  Shipped: {
    type: "order_shipped",
    title: "Your order is on its way",
    text: "has been shipped.",
  },
  Delivered: {
    type: "order_delivered",
    title: "Order delivered",
    text: "was delivered. You can request a return within 7 days if needed.",
  },
  Cancelled: {
    type: "order_cancelled",
    title: "Order cancelled",
    text: "has been cancelled.",
  },
};

const RETURN_COPY: Record<string, string> = {
  requested: "Your return request was received and is under review.",
  approved: "Your return request was approved.",
  rejected: "Your return request was not approved. Contact support for help.",
  item_received: "We received your returned item.",
  refunded: "Your return is complete and the refund was marked as issued.",
};

const REFUND_COPY: Record<string, string> = {
  pending: "Your refund is pending review.",
  processing: "Your refund is being processed.",
  completed: "Your refund was marked as completed.",
  failed: "There was a problem with your refund. Contact support.",
};

export async function notifyOrderPlaced(order: OrderRef) {
  // Customer-facing confirmation only. The store-owner alert is fired directly
  // by the order API route (richer message with COD/paid info), so we must NOT
  // also push an admin notification here or the owner would be pinged twice.
  if (!order.userId) return;
  await createNotification({
    userId: order.userId,
    type: "order_placed",
    title: "Order placed",
    message: `Thanks! Your order ${label(order)} was placed successfully.`,
    href: href(order),
    dedupeKey: `order:${order.$id}:placed`,
  });
}

export async function notifyTrackingReady(order: OrderRef, tracking: string) {
  if (!order.userId) return;
  await createNotification({
    userId: order.userId,
    type: "tracking_ready",
    title: "Tracking available",
    message: `Tracking for order ${label(order)} is ready: ${tracking}.`,
    href: href(order),
    dedupeKey: `order:${order.$id}:tracking:${tracking}`,
  });
}

export async function notifyShipmentStatus(order: OrderRef, status: string) {
  if (!order.userId) return;
  const copy: Record<string, { title: string; text: string; type: Parameters<typeof createNotification>[0]["type"] }> = {
    picked_up: { title: "Picked up by courier", text: "has been picked up by the courier.", type: "order_shipped" },
    in_transit: { title: "Your order is in transit", text: "is on its way through the courier network.", type: "order_shipped" },
    out_for_delivery: { title: "Out for delivery", text: "is out for delivery today.", type: "order_shipped" },
    delivered: { title: "Order delivered", text: "was delivered. You can request a return within 7 days if needed.", type: "order_delivered" },
    cancelled: { title: "Shipment cancelled", text: "shipment was cancelled. Our team will reach out shortly.", type: "order_cancelled" },
    rto: { title: "Delivery attempt update", text: "could not be delivered and is returning to us. Our team will contact you.", type: "order_shipped" },
    returned: { title: "Return received by courier", text: "return was received by the courier.", type: "return_update" },
  };
  const entry = copy[status];
  if (!entry) return;
  await createNotification({
    userId: order.userId,
    type: entry.type,
    title: entry.title,
    message: `Order ${label(order)} ${entry.text}`,
    href: href(order),
    dedupeKey: `order:${order.$id}:shipment:${status}`,
  });
}

/** Notifies only for values that actually changed. */
export async function notifyOrderChanges(
  before: OrderRef,
  updates: { status?: unknown; returnStatus?: unknown; refundStatus?: unknown },
) {
  if (!before.userId) return;
  const { userId } = before;

  if (typeof updates.status === "string" && updates.status !== before.status) {
    const copy = STATUS_COPY[updates.status];
    if (copy) {
      await createNotification({
        userId,
        type: copy.type,
        title: copy.title,
        message: `Order ${label(before)} ${copy.text}`,
        href: href(before),
        dedupeKey: `order:${before.$id}:status:${updates.status}`,
      });
    }
  }

  if (
    typeof updates.returnStatus === "string" &&
    updates.returnStatus !== before.returnStatus &&
    RETURN_COPY[updates.returnStatus]
  ) {
    await createNotification({
      userId,
      type: "return_update",
      title: "Return update",
      message: `Order ${label(before)}: ${RETURN_COPY[updates.returnStatus]}`,
      href: href(before),
      dedupeKey: `order:${before.$id}:return:${updates.returnStatus}`,
    });
  }

  if (
    typeof updates.refundStatus === "string" &&
    updates.refundStatus !== before.refundStatus &&
    REFUND_COPY[updates.refundStatus]
  ) {
    await createNotification({
      userId,
      type: "refund_update",
      title: "Refund update",
      message: `Order ${label(before)}: ${REFUND_COPY[updates.refundStatus]}`,
      href: href(before),
      dedupeKey: `order:${before.$id}:refund:${updates.refundStatus}`,
    });
  }
}
