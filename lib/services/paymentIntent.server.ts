import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CheckoutPricing } from "@/lib/services/checkoutPricing.server";

const COLLECTION = "payment-intents";

export interface CheckoutPaymentIntent {
  userId: string;
  reservationId: string;
  quote: CheckoutPricing;
  couponCode: string;
  referralCode: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Accept non-negative INR amounts with at most two decimal places.
 *
 * Examples:
 *   69       -> valid
 *   69.72    -> valid
 *   0        -> valid
 *   -1       -> invalid
 *   69.721   -> invalid
 *   Infinity -> invalid
 */
function isNonNegativeMoneyAmount(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return false;
  }

  const paise = value * 100;

  return (
    Number.isSafeInteger(Math.round(paise)) &&
    Math.abs(paise - Math.round(paise)) < 1e-6
  );
}

function isPromotion(
  value: unknown,
): value is CheckoutPricing["appliedPromotion"] {
  return (
    value === "welcome" ||
    value === "referral" ||
    value === "coupon" ||
    value === "none"
  );
}

function parsePaymentIntent(value: unknown): CheckoutPaymentIntent | null {
  if (!isRecord(value)) return null;
  const data = value as Record<string, unknown>;
  if (!isRecord(data.quote)) return null;
  const quote = data.quote as Record<string, unknown>;
  const promotion = quote.appliedPromotion;

  if (
    typeof data.userId !== "string" ||
    typeof data.reservationId !== "string" ||
    typeof data.couponCode !== "string" ||
    typeof data.referralCode !== "string" ||
    typeof quote.addressId !== "string" ||
    typeof quote.firstName !== "string" ||
    typeof quote.lastName !== "string" ||
    typeof quote.phone !== "string" ||
    typeof quote.address !== "string" ||
    typeof quote.city !== "string" ||
    typeof quote.postalCode !== "string" ||
    typeof quote.country !== "string" ||
    typeof quote.deliveryMethod !== "string" ||
    typeof quote.deliveryMethodId !== "string" ||
    typeof quote.shippingProvider !== "string" ||
    typeof quote.products !== "string" ||
    typeof quote.discountReason !== "string" ||
    !isPromotion(promotion) ||
    !isNonNegativeMoneyAmount(quote.subtotal) ||
    !isNonNegativeMoneyAmount(quote.shipping) ||
    !isNonNegativeMoneyAmount(quote.discount) ||
    !isNonNegativeMoneyAmount(quote.total)
  ) {
    return null;
  }

  return {
    userId: data.userId,
    reservationId: data.reservationId,
    couponCode: data.couponCode,
    referralCode: data.referralCode,
    quote: {
      addressId: quote.addressId,
      firstName: quote.firstName,
      lastName: quote.lastName,
      phone: quote.phone,
      address: quote.address,
      city: quote.city,
      postalCode: quote.postalCode,
      country: quote.country,
      deliveryMethod: quote.deliveryMethod,
      deliveryMethodId: quote.deliveryMethodId,
      shippingProvider: quote.shippingProvider,
      products: quote.products,
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      discount: quote.discount,
      discountReason: quote.discountReason,
      appliedPromotion: promotion,
      total: quote.total,
    },
  };
}

export async function saveCheckoutPaymentIntent(
  paymentOrderId: string,
  intent: CheckoutPaymentIntent,
): Promise<void> {
  if (!prisma) {
    throw new Error("Database is not configured");
  }

  const data = {
    userId: intent.userId,
    reservationId: intent.reservationId,
    quote: {
      addressId: intent.quote.addressId,
      firstName: intent.quote.firstName,
      lastName: intent.quote.lastName,
      phone: intent.quote.phone,
      address: intent.quote.address,
      city: intent.quote.city,
      postalCode: intent.quote.postalCode,
      country: intent.quote.country,
      deliveryMethod: intent.quote.deliveryMethod,
      deliveryMethodId: intent.quote.deliveryMethodId,
      shippingProvider: intent.quote.shippingProvider,
      subtotal: intent.quote.subtotal,
      products: intent.quote.products,
      shipping: intent.quote.shipping,
      discount: intent.quote.discount,
      discountReason: intent.quote.discountReason,
      appliedPromotion: intent.quote.appliedPromotion,
      total: intent.quote.total,
    },
    couponCode: intent.couponCode,
    referralCode: intent.referralCode,
  } satisfies Prisma.InputJsonValue;

  // Repeated requests for the same Razorpay order ID update the
  // existing intent rather than creating a duplicate database record.
  await prisma.storedDocument.upsert({
    where: {
      collectionKey_id: {
        collectionKey: COLLECTION,
        id: paymentOrderId,
      },
    },
    create: {
      collectionKey: COLLECTION,
      id: paymentOrderId,
      data,
    },
    update: {
      data,
    },
  });
}

export async function getCheckoutPaymentIntent(
  paymentOrderId: string,
): Promise<CheckoutPaymentIntent | null> {
  if (!prisma) {
    throw new Error("Database is not configured");
  }

  const document = await prisma.storedDocument.findUnique({
    where: {
      collectionKey_id: {
        collectionKey: COLLECTION,
        id: paymentOrderId,
      },
    },
    select: {
      data: true,
    },
  });

  if (!document) {
    return null;
  }

  return parsePaymentIntent(document.data);
}
