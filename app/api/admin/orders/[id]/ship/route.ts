import { NextResponse } from "next/server";

import { createShipmentFromOrder } from "@/lib/shipping/createShipmentFromOrder";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

const MAX_ORDER_ID_LENGTH = 128;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await adminAuthErrorResponse();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    if (
      typeof id !== "string" ||
      id.trim().length === 0 ||
      id.length > MAX_ORDER_ID_LENGTH
    ) {
      return errorResponse("A valid order ID is required.", 400);
    }

    const result = await createShipmentFromOrder(id.trim());

    if (!result.success) {
      return errorResponse(
        "Shipment could not be created. Check the order and shipping configuration.",
        400,
      );
    }

    return NextResponse.json({
      success: true,
      shipment: result.shipment,
      shipmentId: result.shipmentId,
      orderId: result.orderId,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      estimatedDelivery: result.estimatedDelivery,
      courier: "courier" in result ? result.courier : undefined,
      awb: "awb" in result ? result.awb : undefined,
      pickup: "pickup" in result ? result.pickup : undefined,
      message: result.message,
    });
  } catch (error) {
    console.error("[admin/orders/:id/ship] Shipment request failed:", error);

    return errorResponse(
      "Unable to process shipment. Please review the order and try again.",
      500,
    );
  }
}
