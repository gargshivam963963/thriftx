import { NextRequest, NextResponse } from "next/server";

import { shipmentService } from "@/lib/shipping";

export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
