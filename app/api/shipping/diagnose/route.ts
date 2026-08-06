import { NextResponse } from "next/server";
import { isShiprocketConfigured } from "@/lib/shipping/providers/auth";
import { PICKUP_ADDRESS } from "@/lib/shipping/constants";
import { getAvailableCouriers } from "@/lib/shipping/providers/couriers";

/**
 * GET /api/shipping/diagnose?pincode=132103
 *
 * Diagnostic endpoint to verify Shiprocket integration:
 * - Shows whether credentials are configured
 * - Shows the resolved pickup address
 * - Attempts a live courier serviceability check
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pincode = url.searchParams.get("pincode") || "132103";

  const configured = isShiprocketConfigured();

  const result: Record<string, unknown> = {
    configured,
    pickupAddress: PICKUP_ADDRESS,
    testPincode: pincode,
  };

  if (configured) {
    try {
      const couriers = await getAvailableCouriers(
        PICKUP_ADDRESS.pincode,
        pincode,
        true,
        0.5,
      );
      result.couriers = couriers;
      result.status = "ok";
    } catch (error) {
      result.status = "error";
      result.message = error instanceof Error ? error.message : "Unknown error";
    }
  } else {
    result.status = "not_configured";
    result.message =
      "Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your environment.";
  }

  return NextResponse.json(result);
}
