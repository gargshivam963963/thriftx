import { NextRequest, NextResponse } from "next/server";

import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { getUserOrder } from "@/lib/services/orderService";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    if (!id || id.length > 128) {
      return NextResponse.json(
        { success: false, message: "Invalid order reference." },
        { status: 400, headers },
      );
    }

    const order = await getUserOrder(user.id, id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200, headers },
    );
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status, headers },
      );
    }

    console.error("GET /api/orders/[id] failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify this order." },
      { status: 500, headers },
    );
  }
}
