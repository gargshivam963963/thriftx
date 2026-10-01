import { NextRequest, NextResponse } from "next/server";

import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/services/adminService";

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
  const { id, status } = record;

  if (!isValidId(id)) {
    return jsonError("A valid order ID is required.", 400);
  }

  if (typeof status !== "string" || !ALLOWED_ORDER_STATUSES.has(status)) {
    return jsonError("Invalid order status.", 400);
  }

  try {
    const updated = await updateOrderStatus(id.trim(), status);

    if (!updated) {
      return jsonError("Order could not be updated.", 404);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/admin/orders] PATCH failed:", error);

    return jsonError("Failed to update order status.", 500);
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
