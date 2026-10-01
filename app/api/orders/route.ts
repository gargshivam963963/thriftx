import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { createOrder, getUserOrders } from "@/lib/services/orderService";
import type { OrderData } from "@/lib/services/orderService";
import { verifyCapturedRazorpayPayment } from "@/lib/razorpay";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";

const MAX_BODY_LENGTH = 16_384;

type CheckoutRequest = {
  paymentMethod: "cod" | "razorpay";
  addressId: string;
  deliveryMethod: string;
  orderId?: string;
  paymentId?: string;
  signature?: string;
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

  const { paymentMethod, addressId, deliveryMethod } = value;

  if (paymentMethod !== "cod" && paymentMethod !== "razorpay") {
    return null;
  }

  if (
    !isNonEmptyString(addressId, 128) ||
    !isNonEmptyString(deliveryMethod, 80)
  ) {
    return null;
  }

  if (paymentMethod === "cod") {
    return {
      paymentMethod,
      addressId: addressId.trim(),
      deliveryMethod: deliveryMethod.trim(),
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
    addressId: addressId.trim(),
    deliveryMethod: deliveryMethod.trim(),
    orderId,
    paymentId,
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

    const contentLength = Number(request.headers.get("content-length") ?? "0");

    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Request is too large.",
        },
        { status: 413 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
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

    // All product, price, shipping, and address data is rebuilt
    // from trusted server-side records.
    const quote = await getCheckoutPricing(
      user.id,
      checkout.addressId,
      checkout.deliveryMethod,
    );

    let orderData: OrderData;

    if (checkout.paymentMethod === "razorpay") {
      const payment = await verifyCapturedRazorpayPayment({
        userId: user.id,
        orderId: checkout.orderId!,
        paymentId: checkout.paymentId!,
        signature: checkout.signature!,
        expectedAmount: Math.round(quote.total * 100),
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

      const paidSubtotal = Number(payment.notes.subtotal);
      const paidShipping = Number(payment.notes.shipping);
      const paidTotal = Number(payment.notes.total);

      const paymentMatchesQuote =
        Number.isFinite(paidSubtotal) &&
        Number.isFinite(paidShipping) &&
        Number.isFinite(paidTotal) &&
        payment.amount === Math.round(quote.total * 100) &&
        paidSubtotal === quote.subtotal &&
        paidShipping === quote.shipping &&
        paidTotal === quote.total &&
        payment.notes.deliveryMethod === quote.deliveryMethod &&
        payment.notes.addressId === quote.addressId;

      if (!paymentMatchesQuote) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your cart or payment details changed. Please retry checkout.",
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
        discount: 0,
        couponCode: "",
        creditUsed: 0,
      };
    } else {
      orderData = {
        ...quote,
        paymentMethod: "cod",
        paymentId: undefined,
        orderId: undefined,
        signature: undefined,
        discount: 0,
        couponCode: "",
        creditUsed: 0,
      };
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
