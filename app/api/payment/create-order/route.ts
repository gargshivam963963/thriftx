import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }
    const { amount, addressId, deliveryMethod } = body as Record<
      string,
      unknown
    >;

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(Math.round(amount * 100)) ||
      typeof addressId !== "string" ||
      typeof deliveryMethod !== "string"
    ) {
      return NextResponse.json(
        { error: "A valid payment amount is required." },
        { status: 400 },
      );
    }

    const quote = await getCheckoutPricing(user.id, addressId, deliveryMethod);
    const amountInPaise = Math.round(quote.total * 100);
    if (Math.round(amount * 100) !== amountInPaise) {
      return NextResponse.json(
        { error: "Your cart or shipping price changed. Review checkout." },
        { status: 409 },
      );
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        subtotal: String(quote.subtotal),
        shipping: String(quote.shipping),
        total: String(quote.total),
        deliveryMethod: quote.deliveryMethod,
        addressId: quote.addressId,
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: error.status },
      );
    }
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Razorpay order creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order." },
      { status: 500 },
    );
  }
}
