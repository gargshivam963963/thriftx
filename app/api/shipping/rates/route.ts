import { NextRequest, NextResponse } from "next/server";

import { SHIPPING_DEFAULTS } from "@/lib/shipping/constants";
import { getCachedShippingRates } from "@/lib/shipping/cachedRates";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");
    const weightValue = searchParams.get("weight");
    const weight = weightValue
      ? Number(weightValue)
      : SHIPPING_DEFAULTS.defaultWeight;

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "A valid six-digit pincode is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid positive weight is required." },
        { status: 400 },
      );
    }

    const rates = await getCachedShippingRates(pincode, weight);

    return NextResponse.json({ success: true, rates });
  } catch (error) {
    console.error("GET /api/shipping/rates error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve shipping rates.",
      },
      { status: 500 },
    );
  }
}
