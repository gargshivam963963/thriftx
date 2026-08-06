import type { Offer, Coupon } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Offer computation helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface CartLine {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
}

export interface OfferResult {
  offerId: string;
  title: string;
  description: string;
  discount: number;
  type: string;
  appliedLines: { id: string; title: string; saved: number }[];
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discount: number;
  message: string;
  coupon?: Coupon;
}

/**
 * Compute BOGO (Buy X Get Y). For a group of qualifying lines, the cheapest
 * `getQuantity` items are free for every `buyQuantity` paid.
 */
function computeBogo(offer: Offer, lines: CartLine[]): OfferResult | null {
  const buyQty = offer.buyQuantity || 1;
  const getQty = offer.getQuantity || 1;

  // Collect total units among qualifying lines
  const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);
  if (totalUnits < buyQty + getQty) return null;

  // Expand each line into individual units with their price
  const units: { price: number; lineId: string; title: string }[] = [];
  for (const line of lines) {
    for (let i = 0; i < line.quantity; i++) {
      units.push({ price: line.price, lineId: line.id, title: line.title });
    }
  }

  // Sort ascending so the cheapest get free
  const sorted = [...units].sort((a, b) => a.price - b.price);

  const groups = Math.floor(totalUnits / (buyQty + getQty));
  const freeUnits = sorted.slice(0, groups * getQty);

  const discount = freeUnits.reduce((sum, u) => sum + u.price, 0);
  if (discount <= 0) return null;

  // Group savings by line
  const byLine = new Map<string, { title: string; saved: number }>();
  for (const u of freeUnits) {
    const existing = byLine.get(u.lineId) || { title: u.title, saved: 0 };
    existing.saved += u.price;
    byLine.set(u.lineId, existing);
  }

  return {
    offerId: offer.id,
    title: offer.title,
    description: offer.description || `Buy ${buyQty} get ${getQty} free`,
    discount,
    type: "bogo",
    appliedLines: Array.from(byLine.entries()).map(([id, v]) => ({
      id,
      title: v.title,
      saved: v.saved,
    })),
  };
}

/**
 * Compute bundle discount (e.g. buy 2 shirts → 10% off).
 */
function computeBundle(offer: Offer, lines: CartLine[]): OfferResult | null {
  const minQty = offer.minQuantity || offer.buyQuantity || 2;
  const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);
  if (totalUnits < minQty) return null;

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const discountType = offer.bundleDiscountType || "percent";
  const value = offer.bundleDiscountValue || 0;

  let discount = 0;
  if (discountType === "percent") {
    discount = Math.round((subtotal * value) / 100);
  } else {
    discount = value;
  }

  if (discount <= 0) return null;

  return {
    offerId: offer.id,
    title: offer.title,
    description: offer.description || `Buy ${minQty}+ items for ${value}% off`,
    discount,
    type: "bundle",
    appliedLines: lines.map((l) => ({
      id: l.id,
      title: l.title,
      saved: Math.round((l.price * l.quantity * discount) / subtotal),
    })),
  };
}

/**
 * Compute threshold reward (spend X → reward).
 */
function computeThreshold(offer: Offer, lines: CartLine[]): OfferResult | null {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const threshold = offer.thresholdAmount || 0;
  if (subtotal < threshold) return null;

  const rewardValue = offer.rewardValue || 0;
  let discount = 0;
  if (offer.rewardType === "percent") {
    discount = Math.round((subtotal * rewardValue) / 100);
  } else {
    discount = rewardValue;
  }

  if (discount <= 0) return null;

  return {
    offerId: offer.id,
    title: offer.title,
    description: offer.description || `Spend ₹${threshold} to unlock reward`,
    discount,
    type: "threshold",
    appliedLines: lines.map((l) => ({
      id: l.id,
      title: l.title,
      saved: Math.round((l.price * l.quantity * discount) / subtotal),
    })),
  };
}

/**
 * Evaluate a single offer against qualifying cart lines.
 */
export function evaluateOffer(
  offer: Offer,
  lines: CartLine[],
): OfferResult | null {
  // Filter lines that match the offer's targeting
  let qualifying = lines;
  if (offer.category) {
    qualifying = qualifying.filter(
      (l) => (l.category || "").toLowerCase() === offer.category!.toLowerCase(),
    );
  }
  if (offer.brand) {
    qualifying = qualifying.filter(
      (l) => (l.brand || "").toLowerCase() === offer.brand!.toLowerCase(),
    );
  }

  if (qualifying.length === 0) return null;

  switch (offer.type) {
    case "bogo":
      return computeBogo(offer, qualifying);
    case "bundle":
      return computeBundle(offer, qualifying);
    case "threshold":
      return computeThreshold(offer, qualifying);
    default:
      return null;
  }
}

/**
 * Evaluate the best offer from a list of offers against cart lines.
 */
export function evaluateOffers(
  offers: Offer[],
  lines: CartLine[],
): OfferResult[] {
  const results: OfferResult[] = [];
  for (const offer of offers) {
    const result = evaluateOffer(offer, lines);
    if (result) results.push(result);
  }
  return results.sort((a, b) => b.discount - a.discount);
}

/**
 * Validate a coupon code against cart subtotal.
 */
export function validateCoupon(
  coupon: Coupon | undefined,
  subtotal: number,
): CouponValidation {
  if (!coupon) {
    return {
      valid: false,
      code: "",
      discount: 0,
      message: "Invalid coupon code",
    };
  }

  const now = new Date();
  if (!coupon.isActive) {
    return {
      valid: false,
      code: coupon.code,
      discount: 0,
      message: "This coupon is no longer active",
    };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return {
      valid: false,
      code: coupon.code,
      discount: 0,
      message: "This coupon has expired",
    };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      code: coupon.code,
      discount: 0,
      message: "This coupon has reached its usage limit",
    };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      code: coupon.code,
      discount: 0,
      message: `Add ₹${(coupon.minOrderValue - subtotal).toLocaleString("en-IN")} more to use this coupon (min ₹${coupon.minOrderValue.toLocaleString("en-IN")})`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  return {
    valid: true,
    code: coupon.code,
    discount,
    message: `Coupon ${coupon.code} applied`,
    coupon,
  };
}
