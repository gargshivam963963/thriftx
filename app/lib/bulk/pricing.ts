/**
 * THRIFTX — Centralized thrift pricing rules.
 *
 * The ONLY source of truth for AI-suggested prices. The AI prompt, the
 * suggestion helper, and any API handler all consume this module so price
 * logic can never drift between the UI, the prompt, and the server.
 *
 * A suggested price is always editable by the owner — this only produces a
 * *starting* value, never a finalized one.
 */

/** The approved standard thrift price set (INR). Ascending. */
export const APPROVED_PRICE_SET = [99, 199, 299, 320, 799, 899] as const;

export type ApprovedPrice = (typeof APPROVED_PRICE_SET)[number];

/**
 * Only genuinely expensive items (verified original/current retail value above
 * this threshold) unlock the premium band. This is NOT an automatic selling
 * price — it only unlocks the higher band, and only when the value is actually
 * verified by the owner.
 */
export const HIGH_VALUE_RETAIL_THRESHOLD = 10_000;

/**
 * Category → baseline price band. Prices are chosen from the approved set,
 * never invented. `undefined` maps to a sensible default band.
 *
 * Band semantics:
 *   "low"    → ₹99   (small accessories / low-value items)
 *   "lower"  → ₹199
 *   "mid"    → ₹299
 *   "midHigh"→ ₹320
 *   "high"   → ₹799
 *   "premium"→ ₹899  (only unlocked for verified high-value items)
 */
const CATEGORY_BAND: Record<string, PriceBand> = {
  // Low-value / accessories
  "Caps": "low",
  "Accessories": "low",
  "Socks": "low",
  "Underwear": "low",
  "Toys": "low",

  // Lower-to-mid apparel
  "T-Shirts": "lower",
  "Tops": "lower",
  "Shorts": "lower",

  // Mid apparel
  "Shirts": "mid",
  "Sweatshirts": "mid",
  "Skirts": "mid",

  // Mid-high
  "Hoodies": "midHigh",
  "Lower": "midHigh",
  "Cargo": "midHigh",

  // High
  "Jeans": "high",
  "Trousers": "high",
  "Jackets": "high",
  "Blazers": "high",
  "Dresses": "high",
};

/**
 * Brands whose garments reliably resell at or above the mid tiers in a
 * thrift context. The suggestion is nudged one band up for these — never
 * more, and never past the ₹799 non-premium ceiling.
 *
 * Compared after normalization (lowercase, alphanumeric only), so
 * "Levi's" → "levis", "H&M" → "hm", "U.S. Polo" → "uspolo".
 */
const PREMIUM_BRANDS = new Set([
  "zara",
  "levis",
  "nike",
  "adidas",
  "puma",
  "reebok",
  "uniqlo",
  "hm",
  "tommyhilfiger",
  "calvinklein",
  "ralphlauren",
  "superdry",
  "lacoste",
  "jackjones",
  "only",
  "veromoda",
  "marksspencer",
  "uspolo",
  "armani",
  "burberry",
  "gucci",
  "prada",
  "versace",
  "dior",
  "louisvuitton",
]);

function normalizeBrand(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Whether the extracted brand counts as a premium resell brand. */
export function isPremiumBrand(brand: string | undefined | null): boolean {
  const normalized = normalizeBrand((brand ?? "").trim());
  if (!normalized) return false;
  return PREMIUM_BRANDS.has(normalized);
}

type PriceBand = "low" | "lower" | "mid" | "midHigh" | "high" | "premium";

/** Ascending band order — used to step a band up one tier. */
const BAND_ORDER: readonly PriceBand[] = [
  "low",
  "lower",
  "mid",
  "midHigh",
  "high",
  "premium",
];

const BAND_PRICE: Record<PriceBand, ApprovedPrice> = {
  low: 99,
  lower: 199,
  mid: 299,
  midHigh: 320,
  high: 799,
  premium: 899,
};

/** Step a band up one tier, capped at `high` (premium stays special). */
function stepUpBand(band: PriceBand): PriceBand {
  const index = BAND_ORDER.indexOf(band);
  const ceiling = BAND_ORDER.indexOf("high");
  return BAND_ORDER[Math.min(index + 1, ceiling)];
}

/**
 * Condition can nudge the price one step down within the low bands when the
 * garment is heavily worn, or keep the baseline for good condition. It can
 * never push a price above the category baseline unless the item qualifies for
 * the premium band via verified retail value.
 */
const DEGRADED_CONDITIONS = new Set(["Fair", "Good"]);

export interface PriceSuggestionInput {
  /** Product category (validated against the existing category list). */
  category?: string;
  /** Condition string from the existing condition enum. */
  condition?: string;
  /**
   * Extracted brand / "cloth company". Premium resell brands nudge the
   * suggested band one tier up (still capped at the approved set).
   */
  brand?: string;
  /**
   * Verified original/current retail value. When it exceeds the high-value
   * threshold (₹10,000), the premium band is unlocked — a very expensive
   * garment should not be listed at a bargain-tier thrift price.
   */
  retailPrice?: number | null;
  /**
   * Explicit flag the owner can set when they have verified the item is genuinely
   * new. Kept for API compatibility; retail value alone now unlocks premium.
   */
  isNew?: boolean;
}

/**
 * Choose a suggested price from the approved standard thrift-price set.
 *
 * Selection is deterministic and rule-based — never random:
 *  - Base band comes from the item's category.
 *  - Worn conditions step the low/mid bands down one tier.
 *  - Premium resell brands (Zara, Levi's, Nike, …) step the band up one tier.
 *  - A verified retail value above ₹10,000 unlocks the premium band (₹899).
 *
 * The result is a *starting* value only — it is always editable by the owner.
 */
export function suggestThriftPrice(input: PriceSuggestionInput): ApprovedPrice {
  const category = (input.category ?? "").trim();
  let band: PriceBand = CATEGORY_BAND[category] ?? "mid";

  const retail = input.retailPrice;
  const highValue =
    typeof retail === "number" &&
    Number.isFinite(retail) &&
    retail > HIGH_VALUE_RETAIL_THRESHOLD;

  // Premium band: verified retail value above the threshold (very expensive
  // garment — never price it at a bargain tier).
  if (highValue) {
    return BAND_PRICE.premium;
  }

  // Step worn low/mid items down one tier for honesty.
  const condition = (input.condition ?? "").trim();
  if (DEGRADED_CONDITIONS.has(condition)) {
    if (band === "mid") band = "lower";
    else if (band === "midHigh") band = "mid";
    else if (band === "high") band = "midHigh";
    else if (band === "lower") band = "low";
  }

  // Premium brands justify one tier up (still within the approved set).
  if (isPremiumBrand(input.brand)) {
    band = stepUpBand(band);
  }

  return BAND_PRICE[band];
}

/** Whether a suggested price came from the AI (for the "suggested" label). */
export function isApprovedPrice(value: number): value is ApprovedPrice {
  return (APPROVED_PRICE_SET as readonly number[]).includes(value);
}
