import { NextRequest, NextResponse } from "next/server";
import { fetchActiveCoupons } from "@/lib/marketing/data";
import { validateCoupon } from "@/lib/marketing/offers";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: "Please enter a coupon code",
        discount: 0,
      });
    }

    const normalized = String(code).trim().toUpperCase();
    const coupons = await fetchActiveCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

    const result = validateCoupon(coupon, Number(subtotal) || 0);

    return NextResponse.json({
      success: result.valid,
      valid: result.valid,
      code: result.code,
      discount: result.discount,
      message: result.message,
      coupon: result.coupon ?? null,
    });
  } catch (error) {
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
