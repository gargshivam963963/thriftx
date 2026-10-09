import { NextResponse } from "next/server";
import { isShiprocketConfigured } from "@/lib/shipping/providers/auth";
import { shiprocketFetch } from "@/lib/shipping/providers/client";
import { PICKUP_ADDRESS } from "@/lib/shipping/constants";
import { getAvailableCouriers } from "@/lib/shipping/providers/couriers";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

/**
 * GET /api/shipping/diagnose?pincode=132103
 *
 * Diagnostic endpoint to verify the live Shiprocket integration.
 *
 * This endpoint intentionally exposes the provider error message to an
 * authenticated admin so the integration can be diagnosed. It does not
 * expose the Shiprocket token or password.
 */
export async function GET(req: Request) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  const url = new URL(req.url);
  const pincode = url.searchParams.get("pincode") || "132103";

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      {
        success: false,
        message: "A valid six-digit pincode is required.",
      },
      { status: 400 },
    );
  }

  const configured = isShiprocketConfigured();

  const result: Record<string, unknown> = {
    configured,
    pickupAddress: PICKUP_ADDRESS,
    sentPickupLocation: PICKUP_ADDRESS.pickupLocation,
    testPincode: pincode,
  };

  if (!configured) {
    result.status = "not_configured";
    result.message = "Shiprocket credentials are not configured on the server.";

    return NextResponse.json(result, { status: 500 });
  }

  try {
    // Fetch registered pickup addresses so the admin can see the exact
    // valid nicknames (pickup_location values) Shiprocket accepts.
    try {
      const pickupRes = await shiprocketFetch<{
        data?: Array<{
          pickup_location?: string;
          nickname?: string;
          name?: string;
          pin_code?: string;
          address?: string;
        }>;
      }>("/settings/company/pickuplist");
      const list = Array.isArray(pickupRes?.data) ? pickupRes.data : [];
      result.pickupLocations = list.map((p) => ({
        nickname: p.pickup_location ?? p.nickname ?? p.name ?? "",
        pincode: p.pin_code ?? "",
        address: p.address ?? "",
      }));
      result.validPickupNicknames = (result.pickupLocations as Array<{
        nickname: string;
      }>).map((p) => p.nickname);
      const match = (
        result.validPickupNicknames as string[]
      ).some(
        (n) =>
          n.trim().toLowerCase() ===
          String(PICKUP_ADDRESS.pickupLocation).trim().toLowerCase(),
      );
      result.pickupLocationMatch = match;
      if (!match && (result.validPickupNicknames as string[]).length > 0) {
        result.pickupHint = `Your SHIPROCKET_PICKUP_LOCATION ("${PICKUP_ADDRESS.pickupLocation}") does not match any registered pickup. Set it to one of: ${(result.validPickupNicknames as string[]).join(", ")}`;
      }
    } catch (pickupError) {
      result.pickupLocationsError =
        pickupError instanceof Error
          ? pickupError.message.slice(0, 300)
          : "Could not fetch pickup list.";
    }

    const couriers = await getAvailableCouriers(
      PICKUP_ADDRESS.pincode,
      pincode,
      true,
      0.5,
    );

    result.couriers = couriers;
    result.courierCount = couriers.length;
    result.status = couriers.length > 0 ? "ok" : "no_couriers";

    if (couriers.length === 0) {
      result.message =
        "Shiprocket responded successfully, but no COD courier is available for this route.";
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "[Shipping Diagnose] Shiprocket serviceability failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Shiprocket serviceability error.";

    result.status = "error";
    result.message = message;

    return NextResponse.json(result, { status: 502 });
  }
}
