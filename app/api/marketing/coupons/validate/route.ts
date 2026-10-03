import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { fetchActiveCoupons } from "@/lib/marketing/data";
import { validateCoupon } from "@/lib/marketing/offers";
import { getCartProductsForUser } from "@/lib/services/cartProducts.server";

const MAX_BODY_BYTES = 2048;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const contentLength = req.headers.get("content-length");
    if (
      contentLength !== null &&
      (!/^\d+$/.test(contentLength) ||
        Number(contentLength) > MAX_BODY_BYTES)
    ) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Invalid coupon request.",
          discount: 0,
        },
        { status: 413 },
      );
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Invalid coupon request.",
          discount: 0,
        },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Please enter a valid coupon code.",
          discount: 0,
        },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !("code" in body) ||
      typeof body.code !== "string" ||
      body.code.trim().length === 0 ||
      body.code.length > 64
    ) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Please enter a valid coupon code.",
          discount: 0,
        },
        { status: 400 },
      );
    }

    const normalized = body.code.trim().toUpperCase();
    const cart = await getCartProductsForUser(user.id);
    if (cart.length === 0) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Your cart is empty.",
          discount: 0,
        },
        { status: 409 },
      );
    }
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const coupons = await fetchActiveCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

    const result = validateCoupon(coupon, subtotal);

    return NextResponse.json({
      success: result.valid,
      valid: result.valid,
      code: result.code,
      discount: result.discount,
      message: result.message,
      coupon: result.coupon ?? null,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Authentication required.",
          discount: 0,
        },
        { status: error.status },
      );
    }
    console.error("POST /api/marketing/coupons/validate error:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: "Failed to validate coupon",
        discount: 0,
      },
      { status: 500 },
    );
  }
}
