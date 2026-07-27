/**
 * Category → Measurement field mapping for thrift clothes.
 * Instead of using S/M/L/XL (which varies by country/brand),
 * we use actual body measurements in inches.
 */

export interface MeasurementConfig {
  label: string;
  field: string;
  unit: string;
  placeholder: string;
  description: string;
}

export interface CategoryMeasurementRule {
  /** Visible measurement fields for this category */
  measurements: MeasurementConfig[];
  /** Whether standard size (S/M/L/XL) is relevant */
  showSizeTag: boolean;
  /** Hint for the user about what to measure */
  hint: string;
}

/**
 * Dynamic measurement rules per category.
 * For thrift clothes, actual chest/waist/length measurements
 * are far more useful than letter sizes (which vary by country).
 */
const categoryRules: Record<string, CategoryMeasurementRule> = {
  // ── Topwear ────────────────────────────────────────────
  "T-Shirts": {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '22"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '28"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Chest is the key fit dimension for t-shirts",
  },
  Shirts: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '22"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '30"',
        description: "From collar seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Collar and sleeve length also matter for formal shirts",
  },
  Hoodies: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '24"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '27"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Hoodies are typically worn loose — size up for oversized fit",
  },
  Sweatshirts: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '23"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '27"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Sweatshirts fit similarly to hoodies",
  },
  Jackets: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '24"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '28"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Jackets should allow room for layering underneath",
  },
  Blazers: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '22"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '30"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Blazers should fit snugly — not too loose",
  },
  Tops: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '20"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '26"',
        description: "From shoulder seam to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Tops vary widely — provide accurate chest for best fit",
  },

  // ── Bottomwear ─────────────────────────────────────────
  Jeans: {
    measurements: [
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '32"',
        description: "Measure across waistband from end to end, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '42"',
        description: "From crotch seam to bottom hem (outseam)",
      },
      {
        label: "Inseam",
        field: "inseam",
        unit: "inches",
        placeholder: '30"',
        description: "From inner crotch to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Waist & inseam are critical for jeans — include both if possible",
  },
  Cargo: {
    measurements: [
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '32"',
        description: "Measure across waistband from end to end, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '42"',
        description: "From waistband to bottom hem",
      },
      {
        label: "Inseam",
        field: "inseam",
        unit: "inches",
        placeholder: '30"',
        description: "From inner crotch to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Cargo pants are often worn slightly loose",
  },
  Trousers: {
    measurements: [
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '32"',
        description: "Measure across waistband from end to end, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '42"',
        description: "From waistband to bottom hem",
      },
      {
        label: "Inseam",
        field: "inseam",
        unit: "inches",
        placeholder: '30"',
        description: "From inner crotch to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Trousers — waist and inseam matter most",
  },
  Shorts: {
    measurements: [
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '32"',
        description: "Measure across waistband from end to end, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '10"',
        description: "From waistband to bottom hem",
      },
    ],
    showSizeTag: true,
    hint: "Shorts length varies by style (above knee, at knee, below)",
  },
  Skirts: {
    measurements: [
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '28"',
        description: "Measure across waistband from end to end, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '24"',
        description: "From waistband to bottom hem",
      },
    ],
    showSizeTag: false,
    hint: "Skirt length is a key preference — be precise",
  },
  Dresses: {
    measurements: [
      {
        label: "Chest",
        field: "chest",
        unit: "inches",
        placeholder: '20"',
        description: "Measure across chest from armpit to armpit, then double",
      },
      {
        label: "Waist",
        field: "waist",
        unit: "inches",
        placeholder: '28"',
        description: "Measure across waist at narrowest point, then double",
      },
      {
        label: "Length",
        field: "length",
        unit: "inches",
        placeholder: '36"',
        description: "From shoulder seam to bottom hem",
      },
    ],
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
      measurements: [
        {
          label: "Chest",
          field: "chest",
          unit: "inches",
          placeholder: '22"',
          description:
            "Measure across chest from armpit to armpit, then double",
        },
      ],
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
