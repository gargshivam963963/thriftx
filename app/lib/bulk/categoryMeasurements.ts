/**
 * Category → Measurement field mapping for thrift clothes.
 * Topwear → Chest + Length only
 * Bottomwear → Waist + Length only
 * Dresses → Chest + Waist + Length
 */

export interface MeasurementConfig {
  label: string;
  field: string;
  unit: string;
  placeholder: string;
  description: string;
  required?: boolean;
}

export interface CategoryMeasurementRule {
  /** Visible measurement fields for this category */
  measurements: MeasurementConfig[];
  /** Whether standard size (S/M/L/XL) is relevant */
  showSizeTag: boolean;
  /** Hint for the user about what to measure */
  hint: string;
}

/** Topwear (upper body): Chest + Length */
const topwearMeasurements: MeasurementConfig[] = [
  {
    label: "Chest",
    field: "chest",
    required: true,
    unit: "inches",
    placeholder: '22"',
    description: "Measure across chest from armpit to armpit, then double",
  },
  {
    label: "Length",
    field: "length",
    required: true,
    unit: "inches",
    placeholder: '28"',
    description: "From shoulder seam to bottom hem",
  },
];

/** General lower body: Waist + Length (used by "Lower" catch-all) */
const lowerMeasurements: MeasurementConfig[] = [
  {
    label: "Waist",
    field: "waist",
    required: true,
    unit: "inches",
    placeholder: '32"',
    description: "Measure across waistband from end to end, then double",
  },
  {
    label: "Length",
    field: "length",
    required: true,
    unit: "inches",
    placeholder: '10"',
    description: "From waistband to bottom hem (inseam for trousers)",
  },
];

/** Bottomwear (lower body): Waist + Length */
const bottomwearMeasurements: MeasurementConfig[] = [
  {
    label: "Waist",
    field: "waist",
    required: true,
    unit: "inches",
    placeholder: '32"',
    description: "Measure across waistband from end to end, then double",
  },
  {
    label: "Length",
    field: "length",
    required: true,
    unit: "inches",
    placeholder: '10"',
    description: "From waistband to bottom hem (inseam for trousers)",
  },
];

/** Dresses: Chest + Waist + Length */
const dressMeasurements: MeasurementConfig[] = [
  {
    label: "Chest",
    field: "chest",
    required: true,
    unit: "inches",
    placeholder: '20"',
    description: "Measure across chest from armpit to armpit, then double",
  },
  {
    label: "Waist",
    field: "waist",
    required: true,
    unit: "inches",
    placeholder: '28"',
    description: "Measure across waist at narrowest point, then double",
  },
  {
    label: "Length",
    field: "length",
    required: true,
    unit: "inches",
    placeholder: '36"',
    description: "From shoulder seam to bottom hem",
  },
];

/** Default fallback: chest only */
const fallbackMeasurements: MeasurementConfig[] = [
  {
    label: "Chest",
    field: "chest",
    required: true,
    unit: "inches",
    placeholder: '22"',
    description: "Measure across chest from armpit to armpit, then double",
  },
];

/**
 * Dynamic measurement rules per category.
 * Simplified: only Chest, Waist, Length — no shoulder, sleeve, rise, inseam, etc.
 */
const categoryRules: Record<string, CategoryMeasurementRule> = {
  // ── Topwear (upper body) ──────────────────────────────
  "T-Shirts": {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Chest is the key fit dimension for t-shirts",
  },
  Shirts: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Measure chest flat across the armpits, length from collar seam",
  },
  Hoodies: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Hoodies are typically worn loose — size up for oversized fit",
  },
  Sweatshirts: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Sweatshirts fit similarly to hoodies",
  },
  Jackets: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Jackets should allow room for layering underneath",
  },
  Blazers: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Blazers should fit snugly — not too loose",
  },
  Tops: {
    measurements: topwearMeasurements,
    showSizeTag: true,
    hint: "Tops vary widely — provide accurate chest for best fit",
  },

  // ── Bottomwear (lower body) ───────────────────────────
  Jeans: {
    measurements: bottomwearMeasurements,
    showSizeTag: true,
    hint: "Waist is measured flat across the waistband, then doubled",
  },
  Cargo: {
    measurements: bottomwearMeasurements,
    showSizeTag: true,
    hint: "Cargo pants are often worn slightly loose",
  },
  Trousers: {
    measurements: bottomwearMeasurements,
    showSizeTag: true,
    hint: "Waist and length (inseam) are most important for trousers",
  },
  Shorts: {
    measurements: bottomwearMeasurements,
    showSizeTag: true,
    hint: "Shorts length varies by style (above knee, at knee, below)",
  },
  Skirts: {
    measurements: bottomwearMeasurements,
    showSizeTag: false,
    hint: "Skirt length is a key preference — be precise",
  },
  Lower: {
    measurements: lowerMeasurements,
    showSizeTag: true,
    hint: "Waist and length are the key measurements for lower wear",
  },

  // ── Dresses ───────────────────────────────────────────
  Dresses: {
    measurements: dressMeasurements,
    showSizeTag: true,
    hint: "Dresses need chest, waist AND length for proper fit",
  },
};

/**
 * Get the measurement config for a given category.
 * Falls back to chest-only for unknown categories.
 */
export function getCategoryMeasurements(
  category: string,
): CategoryMeasurementRule {
  const normalized = category.trim();
  return (
    categoryRules[normalized] ?? {
      measurements: fallbackMeasurements,
      showSizeTag: true,
      hint: "Enter measurements in inches for best fit",
    }
  );
}

/**
 * Get all category names that have measurement rules.
 */
export function getAllMeasurementCategories(): string[] {
  return Object.keys(categoryRules);
}

/**
 * Get visible measurement columns for the spreadsheet editor
 * based on selected category.
 */
export function getVisibleMeasurementColumns(category: string): string[] {
  const rule = getCategoryMeasurements(category);
  return rule.measurements.map((m) => m.field);
}

export { categoryRules };
