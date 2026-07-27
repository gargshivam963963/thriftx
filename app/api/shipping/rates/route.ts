import { NextRequest, NextResponse } from "next/server";

import { shipmentService } from "@/lib/shipping";
import { SHIPPING_DEFAULTS } from "@/lib/shipping/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");
    const weight = parseFloat(
      searchParams.get("weight") ?? String(SHIPPING_DEFAULTS.defaultWeight),
    );

    if (!pincode) {
      return NextResponse.json(
        { success: false, message: "Pincode is required" },
        { status: 400 },
      );
    }

    const rates = await shipmentService.getShippingRates(pincode, weight);

    return NextResponse.json({ success: true, rates });
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
