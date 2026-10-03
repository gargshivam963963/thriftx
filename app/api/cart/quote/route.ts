import { NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { calculatePromotion } from "@/lib/marketing/promotions.server";
import { getCartProductsForUser } from "@/lib/services/cartProducts.server";

const MAX_BODY_BYTES = 2048;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const contentLength = request.headers.get("content-length");
    if (
      contentLength !== null &&
      (!/^\d+$/.test(contentLength) ||
        Number(contentLength) > MAX_BODY_BYTES)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cart quote request." },
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: "Invalid cart quote request." },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid cart quote request." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart quote request." },
        { status: 400 },
      );
    }

    const { couponCode, referralCode } = body as Record<string, unknown>;
    if (
      (couponCode !== undefined &&
        couponCode !== null &&
        (typeof couponCode !== "string" || couponCode.length > 64)) ||
      (referralCode !== undefined &&
        referralCode !== null &&
        (typeof referralCode !== "string" || referralCode.length > 64))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid promotion code." },
        { status: 400 },
      );
    }

    const cart = await getCartProductsForUser(user.id);
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const promotion =
      subtotal > 0
        ? await calculatePromotion(
            user.id,
            subtotal,
            typeof couponCode === "string" ? couponCode.trim() : undefined,
            typeof referralCode === "string" ? referralCode.trim() : undefined,
          )
        : {
            discount: 0,
            discountReason: "",
            appliedPromotion: "none" as const,
          };

    return NextResponse.json(
      {
        success: true,
        quote: {
          subtotal,
          discount: promotion.discount,
          discountReason: promotion.discountReason,
          appliedPromotion: promotion.appliedPromotion,
          total: Math.max(0, subtotal - promotion.discount),
        },
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }

    console.error("POST /api/cart/quote failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to calculate your cart total." },
      { status: 500 },
    );
  }
}
