import { NextRequest, NextResponse } from "next/server";

import { shipmentService } from "@/lib/shipping";
import { SHIPPING_DEFAULTS } from "@/lib/shipping/constants";

const MAX_WEIGHT_KG = 100;

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pincode = searchParams.get("pincode")?.trim();

    const rawWeight = searchParams.get("weight");

    const weight =
      rawWeight === null ? SHIPPING_DEFAULTS.defaultWeight : Number(rawWeight);

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return jsonResponse(
        {
          success: false,
          message: "Enter a valid six-digit pincode.",
        },
        400,
      );
    }

    if (!Number.isFinite(weight) || weight <= 0 || weight > MAX_WEIGHT_KG) {
      return jsonResponse(
        {
          success: false,
          message: `Weight must be greater than 0 and no more than ${MAX_WEIGHT_KG} kg.`,
        },
        400,
      );
    }

    const rates = await shipmentService.getShippingRates(pincode, weight);

    return jsonResponse({
      success: true,
      rates,
    });
  } catch (error) {
    console.error("[api/shipping/rates] Rate lookup failed:", error);

    return jsonResponse(
      {
        success: false,
        message: "Unable to calculate shipping rates.",
      },
      500,
    );
  }
}
