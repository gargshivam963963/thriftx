export interface BulkProduct {
  // Excel
  row: number;
  sku: string;

  // Basic
  title: string;
  brand: string;
  slug: string;

  // Category
  gender: "Men" | "Women" | "Kids" | "Unisex";
  category: string;
  categorySlug: string;

  // Pricing
  price: number;
  retailPrice?: number;
  condition: string;

  // Measurements
  size: string;

  /**
   * Required for topwear validation
   */
  chest?: string;

  /**
   * Required for bottomwear validation
   */
  waist?: string;

  /**
   * Length measurement (topwear: shoulder to hem, bottomwear: waistband to hem)
   */
  length?: string;

  // Details
  color?: string;

  /**
   * Always required
   */
  material: string;

  description?: string;
  shippingInfo?: string;

  // Images
  imageFiles: File[];
  imageUrls: string[];
  primaryImage?: string;

  // AI
  aiGenerated: boolean;

  /** Stores AI confidence scores per field for display */
  aiConfidence?: Record<string, number>;

  /** Fields that need human review after AI extraction */
  aiNeedsReview?: string[];

  // Upload
  status: "Ready" | "Missing Images" | "Invalid" | "Uploading" | "Uploaded";

  errors: string[];
}
