import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/services/orderService";
import { syncTracking } from "@/lib/shipping/services/trackingSync";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const order = await getOrder(orderId);

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
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
