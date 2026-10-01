import { NextRequest, NextResponse } from "next/server";

import { getOrder } from "@/lib/services/orderService";
import { syncTracking } from "@/lib/shipping/services/trackingSync";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";

const MAX_ORDER_ID_LENGTH = 128;

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: PRIVATE_HEADERS,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await requireUser();
    const { orderId } = await params;

    if (
      typeof orderId !== "string" ||
      orderId.trim().length === 0 ||
      orderId.length > MAX_ORDER_ID_LENGTH
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Order not found.",
        },
        404,
      );
    }

    const order = await getOrder(orderId.trim());

    if (!order) {
      return jsonResponse(
        {
          success: false,
          message: "Order not found.",
        },
        404,
      );
    }

    const orderOwnerId = (order as typeof order & { userId?: string }).userId;

    if (orderOwnerId !== user.id && user.role !== "admin") {
      return jsonResponse(
        {
          success: false,
          message: "Order not found.",
        },
        404,
      );
    }

    if (!order.awbNumber) {
      return jsonResponse(
        {
          success: false,
          message: "Order has no AWB assigned.",
        },
        400,
      );
    }

    const tracking = await syncTracking(order.$id, order.awbNumber);

    return jsonResponse({
      success: true,
      tracking,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return jsonResponse(
        {
          success: false,
          message: "Authentication required.",
        },
        error.status,
      );
    }

    console.error("[api/shipping/tracking] Request failed:", error);

    return jsonResponse(
      {
        success: false,
        message: "Unable to load shipment tracking.",
      },
      500,
    );
  }
}
