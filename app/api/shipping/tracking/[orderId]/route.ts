import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/services/orderService";
import { syncTracking } from "@/lib/shipping/services/trackingSync";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await requireUser();
    const { orderId } = await params;
    const order = await getOrder(orderId);

    const orderOwnerId = (order as typeof order & { userId?: string }).userId;
    if (orderOwnerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    if (!order.awbNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Order has no AWB assigned.",
        },
        { status: 400 },
      );
    }

    const tracking = await syncTracking(order.$id, order.awbNumber);

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load shipment tracking.",
      },
      { status: 500 },
    );
  }
}
