import fs from "fs";
import path from "path";

import { CsvProduct } from "./types";

const VALID_GENDERS = ["Men", "Women", "Kids", "Unisex"];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProduct(
  product: CsvProduct,
  imageFolder: string,
  usedSkus: Set<string>,
): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!product.sku) errors.push("SKU is required.");
  if (!product.title) errors.push("Title is required.");
  if (!product.brand) errors.push("Brand is required.");
  if (!product.gender) errors.push("Gender is required.");
  if (!product.category) errors.push("Category is required.");
  if (!product.price) errors.push("Price is required.");
  if (!product.size) errors.push("Size is required.");
  if (!product.condition) errors.push("Condition is required.");

  // Duplicate SKU
  if (usedSkus.has(product.sku)) {
    errors.push(`Duplicate SKU "${product.sku}".`);
  }

  // Gender validation
  if (product.gender && !VALID_GENDERS.includes(product.gender)) {
    errors.push(`Invalid gender "${product.gender}".`);
  }

  // Price validation
  if (
    product.price &&
    (Number.isNaN(Number(product.price)) || Number(product.price) < 0)
  ) {
    errors.push("Invalid price.");
  }

  if (
    product.retailPrice &&
    (Number.isNaN(Number(product.retailPrice)) ||
      Number(product.retailPrice) < 0)
  ) {
    errors.push("Invalid retail price.");
  }

  // Find all images for this SKU
  const imageFiles = fs.readdirSync(imageFolder).filter((file) => {
    const lower = file.toLowerCase();

    return (
      lower.startsWith(`${product.sku.toLowerCase()}-`) &&
      IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
    );
  });

  if (imageFiles.length === 0) {
    errors.push("No images found.");
  }

  // Check primary image (TX001-1.jpg/png/jpeg/webp)
  const primaryExists = IMAGE_EXTENSIONS.some((ext) =>
    fs.existsSync(path.join(imageFolder, `${product.sku}-1${ext}`)),
  );

  if (!primaryExists) {
    errors.push(`Primary image (${product.sku}-1) not found.`);
  }

  if (errors.length === 0) {
    usedSkus.add(product.sku);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
