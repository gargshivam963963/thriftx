import { BulkProduct } from "./types";

const VALID_GENDERS = ["Men", "Women", "Kids", "Unisex"];

const VALID_CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair"];

export interface ValidationOptions {
  categories?: string[];
  brands?: string[];
  maxImages?: number;
}

export function validateProducts(
  products: BulkProduct[],
  options: ValidationOptions = {},
): BulkProduct[] {
  const { categories = [], brands = [], maxImages = 10 } = options;

  const skuMap = new Map<string, number>();
  const slugMap = new Map<string, number>();

  return products
    .map((product) => {
      const errors = [...product.errors];

      const sku = product.sku.trim().toLowerCase();
      const slug = product.slug.trim().toLowerCase();

      skuMap.set(sku, (skuMap.get(sku) ?? 0) + 1);
      slugMap.set(slug, (slugMap.get(slug) ?? 0) + 1);

      if (!product.sku) errors.push("SKU is required.");

      if (!product.title) errors.push("Title is required.");

      if (!product.brand) errors.push("Brand is required.");

      if (!VALID_GENDERS.includes(product.gender))
        errors.push("Invalid gender.");

      if (!VALID_CONDITIONS.includes(product.condition))
        errors.push("Invalid condition.");

      if (!product.category) errors.push("Category is required.");

      if (categories.length && !categories.includes(product.category)) {
        errors.push("Category not found.");
      }

      if (brands.length && !brands.includes(product.brand)) {
        errors.push("Unknown brand.");
      }

      if (product.price <= 0) errors.push("Invalid selling price.");

      if (product.retailPrice && product.retailPrice < product.price) {
        errors.push("Retail price must be greater than selling price.");
      }

      if (!product.size) errors.push("Size is required.");

      if (product.imageFiles.length === 0) errors.push("No images attached.");

      if (product.imageFiles.length > maxImages) {
        errors.push(`Maximum ${maxImages} images allowed.`);
      }

      return {
        ...product,
        errors,
      };
    })
    .map((product) => {
      const errors = [...product.errors];

      if (skuMap.get(product.sku.toLowerCase())! > 1) {
        errors.push("Duplicate SKU.");
      }

      if (slugMap.get(product.slug.toLowerCase())! > 1) {
        errors.push("Duplicate slug.");
      }

      return {
        ...product,
        errors: [...new Set(errors)],
        status: errors.length === 0 ? "Ready" : "Invalid",
      };
    });
}
