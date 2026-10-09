import {
  getAllOrders,
  updateOrderStatus,
  adminUpdateOrder,
  deleteOrder,
} from "@/lib/services/adminService";
import { getOrder } from "@/lib/services/orderService";
import { NextRequest, NextResponse } from "next/server";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

const MAX_BODY_BYTES = 4_096;
const MAX_ID_LENGTH = 128;

const ALLOWED_ORDER_STATUSES = new Set([
  "Pending",
  "Pending (COD)",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

const ALLOWED_RETURN_STATUSES = new Set([
  "none",
  "requested",
  "approved",
  "rejected",
  "item_received",
  "refunded",
]);

const ALLOWED_REFUND_STATUSES = new Set([
  "none",
  "pending",
  "processing",
  "completed",
  "failed",
]);

function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_ID_LENGTH
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const orders = await getAllOrders();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("[api/admin/orders] GET failed:", error);

    return jsonError("Failed to fetch orders.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError("Request is too large.", 413);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError("Invalid request body.", 400);
  }

  const record = body as Record<string, unknown>;
  const { id, status, returnStatus, refundStatus, returnAdminNotes } = record;

  if (!isValidId(id)) {
    return jsonError("A valid order ID is required.", 400);
  }

  const updates: Record<string, unknown> = {};

  if (status !== undefined) {
    if (typeof status !== "string" || !ALLOWED_ORDER_STATUSES.has(status)) {
      return jsonError("Invalid order status.", 400);
    }

    /*
     * "Shipped" must only be reached through
     * the real Shiprocket shipment workflow.
     */
    if (status === "Shipped") {
      try {
        const order = await getOrder(id.trim());

        if (
          !order ||
          !order.shipmentId ||
          !order.awbNumber ||
          order.pickupStatus !== "scheduled"
        ) {
          return jsonError(
            "This order cannot be marked Shipped until Shiprocket confirms the shipment and pickup.",
            409,
          );
        }
      } catch {
        return jsonError("Order could not be verified.", 404);
      }
    }

    /*
     * Delivered must come from the actual shipment
     * lifecycle, not a visual admin-only change.
     */
    if (status === "Delivered") {
      try {
        const order = await getOrder(id.trim());

        if (!order || order.shipmentStatus !== "delivered") {
          return jsonError(
            "This order cannot be marked Delivered until the shipment is actually delivered.",
            409,
          );
        }
      } catch {
        return jsonError("Order could not be verified.", 404);
      }
    }

    updates.status = status;
  }

  if (returnStatus !== undefined) {
    if (
      typeof returnStatus !== "string" ||
      !ALLOWED_RETURN_STATUSES.has(returnStatus)
    ) {
      return jsonError("Invalid return status.", 400);
    }
    updates.returnStatus = returnStatus;
    if (returnStatus === "refunded") {
      updates.refundStatus = "completed";
      updates.refundedAt = new Date().toISOString();
    }
  }

  if (refundStatus !== undefined) {
    if (
      typeof refundStatus !== "string" ||
      !ALLOWED_REFUND_STATUSES.has(refundStatus)
    ) {
      return jsonError("Invalid refund status.", 400);
    }
    updates.refundStatus = refundStatus;
    if (refundStatus === "completed") {
      updates.refundedAt = new Date().toISOString();
    }
  }

  if (returnAdminNotes !== undefined) {
    if (typeof returnAdminNotes === "string") {
      updates.returnAdminNotes = returnAdminNotes.slice(0, 500);
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("No valid fields to update.", 400);
  }

  try {
    const updated = await adminUpdateOrder(id.trim(), updates);

    if (!updated) {
      return jsonError("Order could not be updated.", 404);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/admin/orders] PATCH failed:", error);

    return jsonError("Failed to update order.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  const id = new URL(request.url).searchParams.get("id");

  if (!isValidId(id)) {
    return jsonError("A valid order ID is required.", 400);
  }

  try {
    const deleted = await deleteOrder(id.trim());

    if (!deleted) {
      return jsonError("Order could not be deleted.", 404);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/admin/orders] DELETE failed:", error);

    return jsonError("Failed to delete order.", 500);
  }
}
