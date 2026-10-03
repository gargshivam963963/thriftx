import type { Order } from "@/lib/types/order";

export type CheckoutOrderRequest =
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

export interface CheckoutQuoteRequest {
  addressId: string;
  deliveryMethod: string;
  couponCode?: string;
  referralCode?: string;
}

export interface CheckoutQuote {
  subtotal: number;
  shipping: number;
  discount: number;
  discountReason: string;
  appliedPromotion: "welcome" | "referral" | "coupon" | "none";
  total: number;
  deliveryMethod: string;
}

export async function getUserOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders", { cache: "no-store" });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    orders?: Order[];
  };

  if (!response.ok || !result.success || !Array.isArray(result.orders)) {
    throw new Error(result.message || "Unable to load orders");
  }

  return result.orders;
}

export async function getCheckoutQuote(
  data: CheckoutQuoteRequest,
): Promise<CheckoutQuote> {
  const response = await fetch("/api/checkout/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(data),
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    quote?: CheckoutQuote;
  };

  if (!response.ok || !result.success || !result.quote) {
    throw new Error(result.message || "Unable to calculate checkout total");
  }

  return result.quote;
}

export async function createOrder(data: CheckoutOrderRequest) {
  const attempts = data.paymentMethod === "razorpay" ? 3 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 250 * 2 ** attempt),
      );
      continue;
    }

    let result: { success?: boolean; message?: string };
    try {
      result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
    } catch (error) {
      if (
        data.paymentMethod !== "razorpay" ||
        response.status < 500 ||
        attempt === attempts - 1
      ) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 250 * 2 ** attempt),
      );
      continue;
    }

    if (response.ok && result.success) return result;

    if (
      data.paymentMethod !== "razorpay" ||
      response.status < 500 ||
      attempt === attempts - 1
    ) {
      throw new Error(result.message || "Unable to create order");
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 250 * 2 ** attempt),
    );
  }

  throw new Error("Unable to confirm your payment. Please contact support.");
}

export async function releaseCheckoutReservation(
  orderId: string,
  reservationId: string,
): Promise<void> {
  const response = await fetch("/api/payment/release-reservation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ orderId, reservationId }),
  });
  if (!response.ok) {
    throw new Error("Unable to release the reserved item.");
  }
}
