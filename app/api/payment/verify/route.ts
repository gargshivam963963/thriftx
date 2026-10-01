import { NextRequest, NextResponse } from "next/server";

import { AuthGuardError, requireUser } from "@/lib/auth-guard";

import { verifyCapturedRazorpayPayment } from "@/lib/razorpay";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_ID_LENGTH = 128;

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const contentLength = req.headers.get("content-length");

    if (
      contentLength &&
      (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid payment verification request.",
        },
        413,
      );
    }

    const rawBody = await req.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid payment verification request.",
        },
        413,
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid payment verification request.",
        },
        400,
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid payment verification request.",
        },
        400,
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body as Record<string, unknown>;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      razorpay_order_id.length === 0 ||
      razorpay_order_id.length > MAX_ID_LENGTH ||
      razorpay_payment_id.length === 0 ||
      razorpay_payment_id.length > MAX_ID_LENGTH ||
      !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Payment could not be verified.",
        },
        400,
      );
    }

    const verifiedPayment = await verifyCapturedRazorpayPayment({
      userId: user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!verifiedPayment) {
      return jsonResponse(
        {
          success: false,
          message: "Payment could not be verified.",
        },
        400,
      );
    }

    return jsonResponse({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return jsonResponse(
        {
          success: false,
          message: "Authentication required.",
        },
        error.status,
      );
    }

    console.error("Razorpay payment verification failed:", error);

    return jsonResponse(
      {
        success: false,
        message: "Verification failed.",
      },
      500,
    );
  }
}
