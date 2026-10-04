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

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<Order>;

  return (
    typeof order.$id === "string" &&
    typeof order.$createdAt === "string" &&
    typeof order.orderId === "string" &&
    typeof order.status === "string" &&
    typeof order.subtotal === "number" &&
    typeof order.shipping === "number" &&
    typeof order.total === "number" &&
    typeof order.firstName === "string" &&
    typeof order.lastName === "string" &&
    typeof order.phone === "string" &&
    typeof order.address === "string" &&
    typeof order.city === "string" &&
    typeof order.postalCode === "string" &&
    typeof order.country === "string" &&
    (order.paymentMethod === "cod" || order.paymentMethod === "razorpay") &&
    typeof order.deliveryMethod === "string" &&
    typeof order.products === "string"
  );
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

export async function getUserOrder(documentId: string): Promise<Order> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10_000);
  let response: Response;
  let result: {
    success?: boolean;
    message?: string;
    order?: unknown;
  };

  try {
    response = await fetch(
      `/api/orders/${encodeURIComponent(documentId)}`,
      { cache: "no-store", signal: controller.signal },
    );
    result = (await response.json()) as {
      success?: boolean;
      message?: string;
      order?: unknown;
    };
  } catch (error) {
    if (timedOut) {
      throw new Error("Order verification took too long. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok || !result.success || !isOrder(result.order)) {
    throw new Error(result.message || "Unable to verify this order.");
  }

  return result.order;
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

    let result: { success?: boolean; message?: string; order?: unknown };
    try {
      result = (await response.json()) as {
        success?: boolean;
        message?: string;
        order?: unknown;
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

    if (response.ok && result.success && isOrder(result.order)) {
      return result.order;
    }

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

export async function cancelOrder(
  documentId: string,
  reason?: string,
): Promise<Order> {
  const response = await fetch(
    `/api/orders/${encodeURIComponent(documentId)}/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ reason }),
    },
  );
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    order?: unknown;
  };

  if (!response.ok || !result.success || !isOrder(result.order)) {
    throw new Error(result.message || "Failed to cancel order.");
  }

  return result.order;
}

export async function requestOrderReturn(
  documentId: string,
  reason: string,
): Promise<Order> {
  const response = await fetch(
    `/api/orders/${encodeURIComponent(documentId)}/return`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ reason }),
    },
  );
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    order?: unknown;
  };

  if (!response.ok || !result.success || !isOrder(result.order)) {
    throw new Error(result.message || "Failed to request return.");
  }

  return result.order;
}
