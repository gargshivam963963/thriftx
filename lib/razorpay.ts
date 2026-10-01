import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default razorpay;

export async function verifyCapturedRazorpayPayment({
  userId,
  orderId,
  paymentId,
  signature,
  expectedAmount,
}: {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  expectedAmount?: number;
}): Promise<{ amount: number; notes: Record<string, string> } | null> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !/^[a-f\d]{64}$/i.test(signature)) return null;

  const expectedSignature = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const providedSignature = Buffer.from(signature, "hex");

  if (!timingSafeEqual(expectedSignature, providedSignature)) return null;

  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(orderId),
    razorpay.payments.fetch(paymentId),
  ]);
  const amount = Number(order.amount);
  const notes = Object.fromEntries(
    Object.entries(order.notes ?? {}).filter(
      ([, value]) => typeof value === "string",
    ),
  ) as Record<string, string>;

  if (
    notes.userId !== userId ||
    !Number.isSafeInteger(amount) ||
    (expectedAmount !== undefined && amount !== expectedAmount) ||
    payment.order_id !== orderId ||
    payment.status !== "captured"
  ) {
    return null;
  }

  return {
    amount,
    notes,
  };
}
