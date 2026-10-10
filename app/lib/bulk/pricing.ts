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
 * Only genuinely new items with a verified original/current retail value above
 * this threshold may be considered for a higher, owner-approved price. This is
 * NOT an automatic selling price — it only unlocks the higher band, and only
 * when the item is explicitly new and the value is actually verified.
 */
export const HIGH_VALUE_RETAIL_THRESHOLD = 10_000;

/**
 * Condition buckets that let an item qualify for the higher price band, and
 * only then when the retail threshold is met. Everything else is capped at 799.
 */
const NEW_CONDITIONS = new Set([
  "Brand New with Tags",
  "Brand New without Tags",
]);

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
 *   "premium"→ ₹899  (only unlocked for verified-new, high-value items)
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

type PriceBand = "low" | "lower" | "mid" | "midHigh" | "high" | "premium";

const BAND_PRICE: Record<PriceBand, ApprovedPrice> = {
  low: 99,
  lower: 199,
  mid: 299,
  midHigh: 320,
  high: 799,
  premium: 899,
};

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
   * Verified original/current retail value, only when the owner has actually
   * supplied it (never assumed from a photo). Enables the premium band when the
   * item is also genuinely new.
   */
  retailPrice?: number | null;
  /**
   * Explicit flag the owner can set when they have verified the item is genuinely
   * new. Defaults to inferring from `condition`.
   */
  isNew?: boolean;
}

/**
 * Choose a suggested price from the approved standard thrift-price set.
 *
 * Selection is deterministic and rule-based — never random:
 *  - Base band comes from the item's category.
 *  - Worn conditions step the low/mid bands down one tier.
 *  - The premium band (₹899) is reachable only for genuinely new items whose
 *    verified retail value exceeds the threshold.
 *
 * Always returns a value from APPROVED_PRICE_SET (or the approved high band when
 * justified), so nothing outside the sanctioned set is ever produced.
 */
export function suggestThriftPrice(input: PriceSuggestionInput): ApprovedPrice {
  const category = (input.category ?? "").trim();
  const band: PriceBand = CATEGORY_BAND[category] ?? "mid";

  const isNew =
    typeof input.isNew === "boolean"
      ? input.isNew
      : category !== "" && NEW_CONDITIONS.has((input.condition ?? "").trim());

  const retail = input.retailPrice;
  const highValue =
    typeof retail === "number" &&
    Number.isFinite(retail) &&
    retail > HIGH_VALUE_RETAIL_THRESHOLD;

  // Premium band: genuinely new AND verified high retail value.
  if (isNew && highValue) {
    return BAND_PRICE.premium;
  }

  // Step worn low/mid items down one tier for honesty.
  const condition = (input.condition ?? "").trim();
  if (DEGRADED_CONDITIONS.has(condition)) {
    if (band === "mid") return BAND_PRICE.lower;
    if (band === "midHigh") return BAND_PRICE.mid;
    if (band === "high") return BAND_PRICE.midHigh;
    if (band === "lower") return BAND_PRICE.low;
  }

  return BAND_PRICE[band];
}

/** Whether a suggested price came from the AI (for the "suggested" label). */
export function isApprovedPrice(value: number): value is ApprovedPrice {
  return (APPROVED_PRICE_SET as readonly number[]).includes(value);
}
