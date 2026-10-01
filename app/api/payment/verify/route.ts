import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { verifyCapturedRazorpayPayment } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    const verifiedPayment =
      typeof razorpay_order_id === "string" &&
      typeof razorpay_payment_id === "string" &&
      typeof razorpay_signature === "string"
        ? await verifyCapturedRazorpayPayment({
            userId: user.id,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
          })
        : null;

    if (!verifiedPayment) {
      return NextResponse.json(
        { success: false, message: "Payment could not be verified." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }
    console.error("Razorpay payment verification failed:", error);

    return NextResponse.json(
      { success: false, message: "Verification Failed" },
      { status: 500 },
    );
  }
}
