import { BulkProduct } from "./types";
import { validateImageFile } from "@/lib/services/imageCompression";

const VALID_GENDERS = ["Men", "Women", "Kids", "Unisex"];

const VALID_CONDITIONS = [
  "Brand New with Tags",
  "Brand New without Tags",
  "Like New",
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
];

const VALID_CATEGORIES = [
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Sweatshirts",
  "Jackets",
  "Blazers",
  "Tops",
  "Jeans",
  "Cargo",
  "Trousers",
  "Shorts",
  "Skirts",
  "Dresses",
  "Lower",
];

const UPPER_CATEGORIES = [
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Sweatshirts",
  "Jackets",
  "Blazers",
  "Tops",
];

const LOWER_CATEGORIES = [
  "Jeans",
  "Cargo",
  "Trousers",
  "Shorts",
  "Skirts",
  "Lower",
];

export interface ValidationOptions {
  categories?: string[];
  brands?: string[];
  maxImages?: number;
}

/**
 * Validates a single product and returns error messages.
 * Runs automatically whenever product fields change.
 */
export function validateProduct(
  product: BulkProduct,
  options: ValidationOptions = {},
): string[] {
  const errors: string[] = [];
  const { maxImages = 10 } = options;

  // ── Required fields ───────────────────────────────────
  if (!product.sku?.trim()) errors.push("SKU is required.");
  if (!product.title?.trim()) errors.push("Title is required.");
  if (!product.brand?.trim()) errors.push("Brand is required.");

  if (!product.gender || !VALID_GENDERS.includes(product.gender)) {
    errors.push("Invalid gender.");
  }

  if (!product.condition || !VALID_CONDITIONS.includes(product.condition)) {
    errors.push("Invalid condition.");
  }

  if (!product.category) {
    errors.push("Category is required.");
  } else if (!VALID_CATEGORIES.includes(product.category)) {
    errors.push("Invalid category.");
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    errors.push("Price must be greater than 0.");
  }

  if (product.retailPrice && product.retailPrice < product.price) {
    errors.push("Retail price must be greater than selling price.");
  }

  if (!product.size?.trim()) errors.push("Size is required.");
  if (!product.material?.trim()) errors.push("Material is required.");

  // ── Measurements by category ─────────────────────────
  if (product.category) {
    if (UPPER_CATEGORIES.includes(product.category)) {
      if (!product.chest?.trim())
        errors.push("Chest measurement is required for this category.");
    }
    if (LOWER_CATEGORIES.includes(product.category)) {
      if (!product.waist?.trim())
        errors.push("Waist measurement is required for this category.");
    }
  }

  // ── Images ───────────────────────────────────────────
  if (product.imageFiles.length === 0) {
    errors.push("No images attached.");
  } else if (product.imageFiles.length > maxImages) {
    errors.push(`Maximum ${maxImages} images allowed.`);
  } else {
    for (const file of product.imageFiles) {
      const validation = validateImageFile(file, product.imageFiles.length);
      if (!validation.valid)
        errors.push(validation.reason ?? "Invalid image file.");
    }
  }

  return errors;
}

/**
 * Validates all products and returns them with updated errors.
 * Runs automatically — no manual Validate button needed.
 */
export function validateProducts(
  products: BulkProduct[],
  options: ValidationOptions = {},
): BulkProduct[] {
  const skuMap = new Map<string, number>();
  const slugMap = new Map<string, number>();

  // First pass: count duplicates
  for (const product of products) {
    const sku = product.sku?.trim().toLowerCase() || "";
    const slug = product.slug?.trim().toLowerCase() || "";
    skuMap.set(sku, (skuMap.get(sku) ?? 0) + 1);
    slugMap.set(slug, (slugMap.get(slug) ?? 0) + 1);
  }

  return products.map((product) => {
    if (product.status === "Uploaded" && product.productId) {
      return { ...product, errors: [] };
    }

    const errors = validateProduct(product, options);

    // ── Duplicate checks ───────────────────────────────
    const sku = product.sku?.trim().toLowerCase() || "";
    const slug = product.slug?.trim().toLowerCase() || "";

    if (skuMap.get(sku)! > 1) {
      errors.push("Duplicate SKU.");
    }

    if (slug && slugMap.get(slug)! > 1) {
      errors.push("Duplicate slug.");
    }

    return {
      ...product,
      errors: [...new Set(errors)],
      status:
        errors.length === 0
          ? "Ready"
          : errors.some((error) => error === "No images attached.")
            ? "Missing Images"
            : "Invalid",
    };
  });
}
