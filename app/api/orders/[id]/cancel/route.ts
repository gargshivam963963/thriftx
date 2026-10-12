import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { cancelUserOrder } from "@/lib/services/orderService";
import { shipmentService } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    if (!id || id.length > 128) {
      return NextResponse.json(
        { success: false, message: "Invalid order reference." },
        { status: 400 },
      );
    }

    let reason = "Cancelled by customer";
    try {
      const body = await request.json();
      if (body?.reason && typeof body.reason === "string") {
        reason = body.reason.trim().slice(0, 500);
      }
    } catch {
      // Use default reason
    }

    const order = await cancelUserOrder(user.id, id, reason);

    /*
     * Best-effort: also cancel the Shiprocket shipment so an un-picked-up
     * test/real order stops billing the wallet. Shiprocket only allows
     * cancellation before manifest/pickup — once in transit it returns an
     * error, which we ignore (the order is already Cancelled internally).
     */
    if (order.shipmentId) {
      try {
        await shipmentService.cancelShipment(order.shipmentId);
      } catch (shippingError) {
        console.error(
          "[orders:cancel] Shiprocket shipment cancellation failed:",
          shippingError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      order,
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
        message: error instanceof Error ? error.message : "Failed to cancel order.",
      },
      { status: 400 },
    );
  }
}
