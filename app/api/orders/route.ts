import { notifyOrderPlaced } from "@/lib/notifications/orderEvents";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import {
  createOrder,
  getOrderByPaymentId,
  getUserOrders,
  OrderInventoryConflictError,
} from "@/lib/services/orderService";
import type { OrderData } from "@/lib/services/orderService";
import { verifyCapturedRazorpayPayment } from "@/lib/razorpay";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";
import { recordOrderForReferral } from "@/lib/marketing/promotions.server";
import { getCheckoutPaymentIntent } from "@/lib/services/paymentIntent.server";

const MAX_BODY_LENGTH = 16_384;

type CheckoutRequest =
  | {
      paymentMethod: "cod";
      addressId: string;
      deliveryMethod: string;
      couponCode?: string;
      referralCode?: string;
      idempotencyKey: string;
    }
  | {
      paymentMethod: "razorpay";
      orderId: string;
      paymentId: string;
      signature: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function parseCheckoutRequest(value: unknown): CheckoutRequest | null {
  if (!isRecord(value)) return null;

  const { paymentMethod } = value;

  if (paymentMethod !== "cod" && paymentMethod !== "razorpay") {
    return null;
  }

  if (paymentMethod === "cod") {
    const { addressId, deliveryMethod } = value;
    const optionalString = (key: string, maxLength: number) => {
      const optional = value[key];
      if (optional === undefined || optional === null || optional === "") {
        return undefined;
      }
      return isNonEmptyString(optional, maxLength) ? optional.trim() : null;
    };
    const couponCode = optionalString("couponCode", 64);
    const referralCode = optionalString("referralCode", 64);
    const idempotencyKey = optionalString("idempotencyKey", 128);

    if (
      !isNonEmptyString(addressId, 128) ||
      !isNonEmptyString(deliveryMethod, 80) ||
      !idempotencyKey ||
      couponCode === null ||
      referralCode === null
    ) {
      return null;
    }

    return {
      paymentMethod,
      addressId: addressId.trim(),
      deliveryMethod: deliveryMethod.trim(),
      ...(couponCode ? { couponCode } : {}),
      ...(referralCode ? { referralCode } : {}),
      idempotencyKey,
    };
  }

  const { orderId, paymentId, signature } = value;

  if (
    !isNonEmptyString(orderId, 100) ||
    !isNonEmptyString(paymentId, 100) ||
    typeof signature !== "string" ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return null;
  }

  return {
    paymentMethod,
    orderId: orderId.trim(),
    paymentId: paymentId.trim(),
    signature,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await getUserOrders(user.id);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: error.status },
      );
    }

    console.error("GET /api/orders failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load orders.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const contentLength = request.headers.get("content-length");

    if (
      contentLength !== null &&
      (!/^\d+$/.test(contentLength) ||
        Number(contentLength) > MAX_BODY_LENGTH)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request is too large.",
        },
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { success: false, message: "Request is too large." },
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
          message: "Invalid order details.",
        },
        { status: 400 },
      );
    }

    const checkout = parseCheckoutRequest(body);

    if (!checkout) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid checkout details.",
        },
        { status: 400 },
      );
    }

    if (checkout.paymentMethod === "razorpay") {
      const existingOrder = await getOrderByPaymentId(
        user.id,
        checkout.paymentId,
      );
      if (existingOrder) {
        return NextResponse.json(
          { success: true, order: existingOrder },
          { status: 200 },
        );
      }
    }

    let orderData: OrderData;
    let eligibleReferralCode: string | undefined;

    if (checkout.paymentMethod === "razorpay") {
      const payment = await verifyCapturedRazorpayPayment({
        userId: user.id,
        orderId: checkout.orderId,
        paymentId: checkout.paymentId,
        signature: checkout.signature,
      });

      if (!payment) {
        return NextResponse.json(
          {
            success: false,
            message: "Payment could not be verified.",
          },
          { status: 400 },
        );
      }

      const intent = await getCheckoutPaymentIntent(checkout.orderId);
      if (!intent || intent.userId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "We could not confirm your payment details. Please contact support before retrying.",
          },
          { status: 409 },
        );
      }

      const { quote } = intent;
      const paidSubtotal = Number(payment.notes.subtotal);
      const paidShipping = Number(payment.notes.shipping);
      const paidDiscount = Number(payment.notes.discount || "0");
      const paidTotal = Number(payment.notes.total);

      const paymentMatchesIntent =
        Number.isFinite(paidSubtotal) &&
        Number.isFinite(paidShipping) &&
        Number.isFinite(paidDiscount) &&
        Number.isFinite(paidTotal) &&
        payment.amount === Math.round(quote.total * 100) &&
        paidSubtotal === quote.subtotal &&
        paidShipping === quote.shipping &&
        paidDiscount === quote.discount &&
        paidTotal === quote.total &&
        payment.notes.inventoryReservationId === intent.reservationId &&
        payment.notes.couponCode === intent.couponCode &&
        payment.notes.referralCode === intent.referralCode &&
        payment.notes.discountReason === quote.discountReason &&
        payment.notes.appliedPromotion === quote.appliedPromotion &&
        payment.notes.deliveryMethod === quote.deliveryMethod &&
        payment.notes.addressId === quote.addressId;

      if (!paymentMatchesIntent) {
        return NextResponse.json(
          {
            success: false,
            message:
              "We could not match this payment to its checkout details. Please contact support.",
          },
          { status: 409 },
        );
      }

      orderData = {
        ...quote,
        paymentMethod: "razorpay",
        paymentId: checkout.paymentId,
        orderId: checkout.orderId,
        signature: checkout.signature,
        couponCode: intent.couponCode,
        creditUsed: 0,
        reservationId: intent.reservationId,
      };
      if (quote.appliedPromotion === "referral") {
        eligibleReferralCode = intent.referralCode;
      }
    } else {
      // COD orders are recalculated from current trusted cart, address,
      // shipping, and promotion records at the point of order creation.
      const quote = await getCheckoutPricing(
        user.id,
        checkout.addressId,
        checkout.deliveryMethod,
        checkout.couponCode,
        checkout.referralCode,
      );
      orderData = {
        ...quote,
        paymentMethod: "cod",
        paymentId: undefined,
        orderId: undefined,
        signature: undefined,
        // Discount is already in quote (calculated server-side)
        couponCode:
          quote.appliedPromotion === "coupon" ? checkout.couponCode ?? "" : "",
        creditUsed: 0,
        idempotencyKey: checkout.idempotencyKey,
      };
      if (quote.appliedPromotion === "referral") {
        eligibleReferralCode = checkout.referralCode;
      }
    }

    const order = await createOrder(orderData, {
      id: user.id,
      email: user.email,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order service is temporarily unavailable.",
        },
        { status: 503 },
      );
    }

    revalidatePath("/product/[slug]", "page");

    if ("$id" in order && typeof order.$id === "string") {
      try {
        await notifyOrderPlaced({
          $id: order.$id,
          userId: user.id,
          orderId:
            "orderId" in order && typeof order.orderId === "string"
              ? order.orderId
              : undefined,
        });
      } catch (notifyError) {
        console.error("Order placed notification failed:", notifyError);
      }
    }

    if (eligibleReferralCode) {
      const orderDocumentId =
        "$id" in order && typeof order.$id === "string" ? order.$id : "";
      if (
        !orderDocumentId ||
        !(await recordOrderForReferral(
          orderDocumentId,
          user.id,
          eligibleReferralCode,
        ))
      ) {
        console.error(
          "Failed to link the eligible referral to the created order.",
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: error.status },
      );
    }

    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status },
      );
    }
    if (error instanceof OrderInventoryConflictError) {
      return NextResponse.json(
        {
          success: false,
          message: "An item in your cart has just been sold. Please refresh your cart.",
        },
        { status: 409 },
      );
    }

    console.error("POST /api/orders failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create order.",
      },
      { status: 500 },
    );
  }
}
