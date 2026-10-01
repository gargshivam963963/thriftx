import { NextRequest, NextResponse } from "next/server";

import { shipmentService } from "@/lib/shipping";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const payload = await req.json();

    const result = await shipmentService.createShipment(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/shipping/create error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to create shipment.",
      },
      {
        status: 500,
      },
    );
  }
}
