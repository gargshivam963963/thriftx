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

  /**
   * True when `imageFiles[0]` is an AI-generated main cover image (identical
   * product, clean studio backdrop) rather than an original photo.
   */
  aiCover?: boolean;

  // AI
  aiGenerated: boolean;

  /** Stores AI confidence scores per field for display */
  aiConfidence?: Record<string, number>;

  /** Fields that need human review after AI extraction */
  aiNeedsReview?: string[];

  // Upload
  productId?: string;
  /**
   * True when a draft of this product already exists in the admin (created
   * via "Save draft"). The row stays `Ready` so it can still be published.
   */
  draftSaved?: boolean;
  status: "Ready" | "Missing Images" | "Invalid" | "Uploading" | "Uploaded";

  errors: string[];
}
