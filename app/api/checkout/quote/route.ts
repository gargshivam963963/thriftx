import { NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalCode(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.trim().length > 64) return null;
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid checkout details." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid checkout details." },
        { status: 400 },
      );
    }

    const { addressId, deliveryMethod } = body;
    const couponCode = optionalCode(body.couponCode);
    const referralCode = optionalCode(body.referralCode);

    if (
      typeof addressId !== "string" ||
      addressId.trim().length === 0 ||
      addressId.length > 128 ||
      typeof deliveryMethod !== "string" ||
      deliveryMethod.trim().length === 0 ||
      deliveryMethod.length > 120 ||
      couponCode === null ||
      referralCode === null
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid checkout details." },
        { status: 400 },
      );
    }

    const quote = await getCheckoutPricing(
      user.id,
      addressId.trim(),
      deliveryMethod.trim(),
      couponCode,
      referralCode,
    );

    return NextResponse.json(
      {
        success: true,
        quote: {
          subtotal: quote.subtotal,
          shipping: quote.shipping,
          discount: quote.discount,
          discountReason: quote.discountReason,
          appliedPromotion: quote.appliedPromotion,
          total: quote.total,
          deliveryMethod: quote.deliveryMethod,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          Vary: "Cookie",
        },
      },
    );
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("POST /api/checkout/quote failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to calculate checkout total." },
      { status: 500 },
    );
  }
}
