import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/services/adminService";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const orders = await getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[api/admin/orders] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status } = body ?? {};
    if (!id || typeof status !== "string") {
      return NextResponse.json(
        { success: false, message: "id and status required" },
        { status: 400 },
      );
    }
    const ok = await updateOrderStatus(id, status);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[api/admin/orders] PATCH failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { success: false, message: "id required" },
        { status: 400 },
      );
    const ok = await deleteOrder(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[api/admin/orders] DELETE failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 },
    );
  }
}
