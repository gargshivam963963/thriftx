import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

let razorpayClient: Razorpay | null = null;

export default function getRazorpayClient(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }
  razorpayClient ??= new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  return razorpayClient;
}

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

  const razorpay = getRazorpayClient();
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
    order.currency !== "INR" ||
    payment.currency !== "INR" ||
    Number(payment.amount) !== amount ||
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
