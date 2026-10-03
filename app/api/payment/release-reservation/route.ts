import { NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import getRazorpayClient from "@/lib/razorpay";
import { releaseCheckoutInventory } from "@/lib/services/inventory.server";
import { getCheckoutPaymentIntent } from "@/lib/services/paymentIntent.server";

const MAX_BODY_BYTES = 1024;

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
        { success: false, message: "Invalid reservation." },
        { status: 413 },
      );
    }
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: "Invalid reservation." },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid reservation." },
        { status: 400 },
      );
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !("reservationId" in body) ||
      typeof body.reservationId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.reservationId) ||
      !("orderId" in body) ||
      typeof body.orderId !== "string" ||
      body.orderId.length === 0 ||
      body.orderId.length > 128
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid reservation." },
        { status: 400 },
      );
    }

    const intent = await getCheckoutPaymentIntent(body.orderId);
    if (
      !intent ||
      intent.userId !== user.id ||
      intent.reservationId !== body.reservationId
    ) {
      return NextResponse.json(
        { success: false, message: "Reservation could not be confirmed." },
        { status: 404 },
      );
    }

    const paymentResult = await getRazorpayClient().orders.fetchPayments(
      body.orderId,
    );
    if (paymentResult.items.some((payment) => payment.status !== "failed")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is still processing. Inventory remains reserved while its status is confirmed.",
        },
        { status: 409 },
      );
    }

    await releaseCheckoutInventory(user.id, intent.reservationId);
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }

    console.error("POST /api/payment/release-reservation failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to release checkout reservation." },
      { status: 500 },
    );
  }
}
