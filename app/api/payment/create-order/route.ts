import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import getRazorpayClient from "@/lib/razorpay";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";
import {
  InventoryReservationSchemaError,
  InventoryUnavailableError,
  releaseCheckoutInventory,
  reserveCheckoutInventory,
} from "@/lib/services/inventory.server";
import { saveCheckoutPaymentIntent } from "@/lib/services/paymentIntent.server";

const MAX_BODY_BYTES = 8 * 1024;

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
        { error: "Invalid request body." },
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
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
    const { addressId, deliveryMethod, couponCode, referralCode } =
      body as Record<string, unknown>;

    if (
      typeof addressId !== "string" ||
      addressId.trim().length === 0 ||
      addressId.length > 128 ||
      typeof deliveryMethod !== "string" ||
      deliveryMethod.trim().length === 0 ||
      deliveryMethod.length > 120 ||
      (couponCode !== undefined &&
        couponCode !== null &&
        (typeof couponCode !== "string" || couponCode.length > 64)) ||
      (referralCode !== undefined &&
        referralCode !== null &&
        (typeof referralCode !== "string" || referralCode.length > 64))
    ) {
      return NextResponse.json(
        { error: "Invalid checkout details." },
        { status: 400 },
      );
    }

    const quote = await getCheckoutPricing(
      user.id,
      addressId.trim(),
      deliveryMethod.trim(),
      typeof couponCode === "string" ? couponCode.trim() : undefined,
      typeof referralCode === "string" ? referralCode.trim() : undefined,
    );
    const amountInPaise = Math.round(quote.total * 100);
    if (amountInPaise <= 0 || !Number.isSafeInteger(amountInPaise)) {
      return NextResponse.json(
        { error: "Online payment is unavailable for this order total." },
        { status: 400 },
      );
    }
    if (
      !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      console.error("Razorpay credentials are not configured.");
      return NextResponse.json(
        { error: "Online payment is temporarily unavailable." },
        { status: 503 },
      );
    }

    const reservationId = randomUUID();
    const productIds = (JSON.parse(quote.products) as { id: string }[]).map(
      (product) => product.id,
    );
    await reserveCheckoutInventory(user.id, productIds, reservationId);

    let order;
    try {
      order = await getRazorpayClient().orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `THRIFTX${randomUUID().replaceAll("-", "")}`,
        notes: {
          userId: user.id,
          inventoryReservationId: reservationId,
          couponCode:
            quote.appliedPromotion === "coupon" &&
            typeof couponCode === "string"
              ? couponCode.trim().toUpperCase()
              : "",
          referralCode:
            quote.appliedPromotion === "referral" &&
            typeof referralCode === "string"
              ? referralCode.trim()
              : "",
          subtotal: String(quote.subtotal),
          shipping: String(quote.shipping),
          discount: String(quote.discount),
          discountReason: quote.discountReason,
          appliedPromotion: quote.appliedPromotion,
          total: String(quote.total),
          deliveryMethod: quote.deliveryMethod,
          addressId: quote.addressId,
        },
      });
      await saveCheckoutPaymentIntent(order.id, {
        userId: user.id,
        reservationId,
        quote,
        couponCode:
          quote.appliedPromotion === "coupon" &&
          typeof couponCode === "string"
            ? couponCode.trim().toUpperCase()
            : "",
        referralCode:
          quote.appliedPromotion === "referral" &&
          typeof referralCode === "string"
            ? referralCode.trim()
            : "",
      });
    } catch (error) {
      await releaseCheckoutInventory(user.id, reservationId);
      throw error;
    }

    return NextResponse.json({
      id: order.id,
      reservationId,
      amount: order.amount,
      currency: order.currency,
      quote: {
        subtotal: quote.subtotal,
        shipping: quote.shipping,
        discount: quote.discount,
        discountReason: quote.discountReason,
        appliedPromotion: quote.appliedPromotion,
        total: quote.total,
      },
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
    if (error instanceof InventoryUnavailableError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      );
    }
    if (error instanceof InventoryReservationSchemaError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 },
      );
    }
    console.error("Razorpay order creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order." },
      { status: 500 },
    );
  }
}
