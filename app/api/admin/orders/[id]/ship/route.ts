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
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
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
      const status =
        result.code === "SHIPMENT_CREATION_IN_PROGRESS" ? 409 : 400;
      return NextResponse.json(
        {
          success: false,
          message:
            result.message ||
            "Shipment could not be created. Check the order and shipping configuration.",
          code: (result as { code?: string }).code,
          details: (result as { details?: unknown }).details,
        },
        { status },
      );
    }

    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error("[admin/orders/:id/ship] Shipment request failed:", error);

    return errorResponse(
      "Unable to process shipment. Please review the order and try again.",
      500,
    );
  }
}
