import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { createOrder, getUserOrders } from "@/lib/services/orderService";
import type { OrderData } from "@/lib/services/orderService";
import { verifyCapturedRazorpayPayment } from "@/lib/razorpay";
import {
  CheckoutPricingError,
  getCheckoutPricing,
} from "@/lib/services/checkoutPricing.server";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await getUserOrders(user.id);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid order details" },
        { status: 400 },
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid order details" },
        { status: 400 },
      );
    }
    const data = body as OrderData;

    if (
      !["cod", "razorpay"].includes(data.paymentMethod) ||
      typeof data.subtotal !== "number" ||
      typeof data.shipping !== "number" ||
      typeof data.total !== "number" ||
      typeof data.products !== "string" ||
      !data.products ||
      typeof data.addressId !== "string" ||
      typeof data.deliveryMethod !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order details" },
        { status: 400 },
      );
    }

    let verifiedOrderData: OrderData;
    if (data.paymentMethod === "razorpay") {
      if (
        typeof data.orderId !== "string" ||
        typeof data.paymentId !== "string" ||
        typeof data.signature !== "string"
      ) {
        return NextResponse.json(
          { success: false, message: "Payment could not be verified." },
          { status: 400 },
        );
      }

      const quote = await getCheckoutPricing(
        user.id,
        data.addressId,
        data.deliveryMethod,
      );
      const payment = await verifyCapturedRazorpayPayment({
        userId: user.id,
        orderId: data.orderId,
        paymentId: data.paymentId,
        signature: data.signature,
        expectedAmount: Math.round(quote.total * 100),
      });
      const subtotal = Number(payment?.notes.subtotal);
      const shipping = Number(payment?.notes.shipping);
      const total = Number(payment?.notes.total);

      if (
        !payment ||
        !Number.isFinite(subtotal) ||
        !Number.isFinite(shipping) ||
        !Number.isFinite(total) ||
        payment.amount !== Math.round(total * 100) ||
        subtotal !== quote.subtotal ||
        shipping !== quote.shipping ||
        total !== quote.total ||
        data.subtotal !== subtotal ||
        data.shipping !== shipping ||
        data.total !== total ||
        data.deliveryMethod !== payment.notes.deliveryMethod ||
        data.addressId !== payment.notes.addressId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your cart or payment details changed. Please retry checkout.",
          },
          { status: 409 },
        );
      }

      verifiedOrderData = {
        ...data,
        ...quote,
        discount: 0,
        couponCode: "",
        creditUsed: 0,
      };
    } else {
      const quote = await getCheckoutPricing(
        user.id,
        data.addressId,
        data.deliveryMethod,
      );
      verifiedOrderData = {
        ...data,
        ...quote,
        discount: 0,
        couponCode: "",
        creditUsed: 0,
        paymentId: undefined,
        orderId: undefined,
        signature: undefined,
      };
    }

    const order = await createOrder(verifiedOrderData, {
      id: user.id,
      email: user.email,
    });

    return NextResponse.json({ success: true, order });
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
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create order" },
      { status: 500 },
    );
  }
}
