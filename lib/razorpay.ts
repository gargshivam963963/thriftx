import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import "server-only";

let razorpayClient: Razorpay | null = null;
let cachedKeyId: string | null = null;

export default function getRazorpayClient(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }
  // If Vercel env vars rotate (live <-> test, key rollover), the old cached
  // client would sign/verify with the WRONG secret — every payment then fails
  // signature/401. Re-create the client when the key id changes instead of
  // reusing a stale singleton for the lifetime of the serverless instance.
  if (!razorpayClient || cachedKeyId !== keyId) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    cachedKeyId = keyId;
  }
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

  let expectedSignature: Buffer;
  let providedSignature: Buffer;
  try {
    expectedSignature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest();
    providedSignature = Buffer.from(signature, "hex");
  } catch {
    return null;
  }

  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  )
    return null;

  const razorpay = getRazorpayClient();
  // The bundled razorpay@2 typings type `fetch` as returning void; the real
  // API returns the order/payment objects. Type the results explicitly so a
  // future SDK upgrade can't silently turn these into `undefined`.
  interface RazorpayOrderLike {
    amount: number | string;
    currency: string;
    notes?: Record<string, unknown> | null;
  }
  interface RazorpayPaymentLike {
    amount: number | string;
    currency: string;
    order_id: string;
    status: string;
  }
  let order: RazorpayOrderLike;
  let payment: RazorpayPaymentLike;
  try {
    [order, payment] = (await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ])) as unknown as [RazorpayOrderLike, RazorpayPaymentLike];
  } catch (error) {
    // Network/API failure or unknown IDs — caller maps to 502/retryable.
    // Never log IDs or secrets; the order/payment IDs are already known to
    // the caller for its own redacted logging.
    console.error("[razorpay] failed to fetch order/payment for verification:", {
      code:
        typeof error === "object" && error !== null && "statusCode" in error
          ? String((error as { statusCode?: unknown }).statusCode)
          : "unknown",
      message: error instanceof Error ? error.message : "unknown error",
    });
    throw error;
  }
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
    // Safe diagnostic: which invariant failed + Razorpay payment status only.
    // No IDs, secrets, signatures, or customer data are logged here.
    const failedChecks: string[] = [];
    if (notes.userId !== userId) failedChecks.push("notes_user_mismatch");
    if (!Number.isSafeInteger(amount)) failedChecks.push("amount_not_integer");
    if (expectedAmount !== undefined && amount !== expectedAmount)
      failedChecks.push("expected_amount_mismatch");
    if (order.currency !== "INR" || payment.currency !== "INR")
      failedChecks.push("currency_mismatch");
    if (Number(payment.amount) !== amount)
      failedChecks.push("order_payment_amount_mismatch");
    if (payment.order_id !== orderId)
      failedChecks.push("order_payment_link_mismatch");
    if (payment.status !== "captured")
      failedChecks.push(`payment_status_${String(payment.status)}`);
    console.error("[razorpay] payment verification invariant failed:", {
      checks: failedChecks,
      paymentStatus: String(payment.status),
    });
    return null;
  }

  return {
    amount,
    notes,
  };
}
