/**
 * smart-processor.ts
 *
 * Converts raw folder structures into BulkProduct[].
 * Each subfolder = 1 product. Images are auto-sorted and labeled.
 * Output is compatible with the existing upload pipeline.
 */

import type { BulkProduct } from "./types";
import {
  getImageLabels,
  autoDetectSort,
  isPhoneSource,
  isDefectImage,
  sortByFilename,
  type ImageLabel,
} from "./image-sorter";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

/**
 * Check if a file is an image by extension.
 */
function isImage(file: File): boolean {
  const name = file.name.toLowerCase();
  return IMAGE_EXTS.some((ext) => name.endsWith(ext));
}

/**
 * Extract folder name from a file's webkitRelativePath.
 * Structure: parentFolder/subfolder/filename.ext
 */
function getSubfolderName(file: File): string | null {
  const path = (file as File & { webkitRelativePath?: string })
    .webkitRelativePath;

  if (!path) return null;

  const parts = path.split("/");

  // parentFolder/subfolderName/image.jpg → parts[1]
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // subfolder name
  }

  return null;
}

/**
 * Group files by their subfolder.
 */
function groupBySubfolder(files: File[]): Map<string, File[]> {
  const groups = new Map<string, File[]>();

  for (const file of files) {
    const folderName = getSubfolderName(file);

    if (!folderName) {
      // Files without folder structure go into "Uncategorized"
      const key = "Uncategorized";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(file);
      continue;
    }

    if (!groups.has(folderName)) {
      groups.set(folderName, []);
    }

    groups.get(folderName)!.push(file);
  }

  return groups;
}

/**
 * Filter out non-image files and return only image Files.
 */
function filterImages(files: File[]): File[] {
  return files.filter(isImage);
}

/**
 * Generate a clean SKU from a folder name.
 * "Nike T-Shirt Black" → "NIKE-T-SHIRT-BLACK"
 * "Vintage Levis 501" → "VINTAGE-LEVIS-501"
 */
function generateSku(folderName: string): string {
  return folderName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a slug from a folder name (lowercase, hyphens).
 */
function generateSlug(folderName: string): string {
  return folderName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Clean a folder name to use as a product title.
 * "nike-t-shirt-black" → "Nike T Shirt Black"
 * "IMG_20240101_12345" → null (not a valid title)
 */
function folderNameToTitle(folderName: string): string | null {
  const cleaned = folderName.trim();

  // Detect phone-generated folder names
  if (
    /^img[-_]/i.test(cleaned) ||
    /^photo[-_]/i.test(cleaned) ||
    /^received[-_]/i.test(cleaned) ||
    /^whatsapp/i.test(cleaned) ||
    /^p[-_]\d+/i.test(cleaned) ||
    /^\d{8}_\d{6}/.test(cleaned) ||
    /^unknown/i.test(cleaned)
  ) {
    return null; // Can't determine title from folder name
  }

  // Convert hyphens/underscores to spaces, clean up
  return cleaned.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Process a folder of files into a BulkProduct.
 */
function processProductFolder(
  folderName: string,
  imageFiles: File[],
): BulkProduct {
  const errors: string[] = [];

  // Filter to images only
  const images = filterImages(imageFiles);

  if (images.length === 0) {
    errors.push("No images found in folder.");
  }

  // Auto-detect sort method
  const isPhone = isPhoneSource(images);
  let sortedImages: File[];

  const sortResult = autoDetectSort(images);
  if (sortResult.sync) {
    sortedImages = sortResult.files;
  } else {
    // We'll handle async sorting at the processSmartFolders level
    // For now, use filename sort as fallback
    sortedImages = sortByFilename(images);
  }

  // Detect defect images and move them to last position
  const defectImages = sortedImages.filter((f) => isDefectImage(f.name));
  const nonDefectImages = sortedImages.filter((f) => !isDefectImage(f.name));

  if (defectImages.length > 0) {
    sortedImages = [...nonDefectImages, ...defectImages];
  }

  // Generate labels
  const labels: ImageLabel[] = getImageLabels(sortedImages.length);

  // Generate product title from folder name
  const title = folderNameToTitle(folderName) ?? "";

  // Generate SKU and slug
  const sku = generateSku(folderName || title || "product");
  const slug = generateSlug(folderName || title || "product");

  const imageUrls = sortedImages.map((image) => URL.createObjectURL(image));

  return {
    row: 0,
    sku,
    title,
    brand: "",
    slug,
    gender: "Unisex",
    category: "",
    categorySlug: "",
    price: 0,
    retailPrice: undefined,
    condition: "Excellent",
    size: "",
    chest: "",
    waist: "",
    length: "",
    color: "",
    material: "",
    description: "",
    shippingInfo:
      "Ships within 24 hours. Pan India delivery in 3-7 business days.",
    imageFiles: sortedImages,
    imageUrls,
    primaryImage: imageUrls[0],
    aiGenerated: false,
    status: sortedImages.length > 0 ? "Ready" : "Missing Images",
    errors,
  };
}

/**
 * Result from processing smart folders.
 */
export interface SmartProcessResult {
  products: BulkProduct[];
  stats: {
    totalFolders: number;
    totalImages: number;
    readyCount: number;
    issueCount: number;
    uncategorizedFiles: number;
  };
}

/**
 * Process all files from a folder upload into BulkProduct[].
 *
 * @param files - All files from the folder upload (via webkitRelativePath)
 * @returns SmartProcessResult with products and stats
 */
export function processSmartFolders(files: File[]): SmartProcessResult {
  const allImages = filterImages(files);

  // Group by subfolder
  const grouped = groupBySubfolder(allImages);

  const products: BulkProduct[] = [];
  let uncategorizedFiles = 0;

  for (const [folderName, folderFiles] of grouped.entries()) {
    if (folderName === "Uncategorized") {
      uncategorizedFiles = folderFiles.length;
      continue;
    }

    const product = processProductFolder(folderName, folderFiles);
    product.row = products.length + 1;
    products.push(product);
  }

  const readyCount = products.filter(
    (p) => p.status === "Ready" && p.errors.length === 0,
  ).length;
  const issueCount = products.filter(
    (p) => p.status !== "Ready" || p.errors.length > 0,
  ).length;

  return {
    products,
    stats: {
      totalFolders: grouped.size - (uncategorizedFiles > 0 ? 1 : 0),
      totalImages: allImages.length,
      readyCount,
      issueCount,
      uncategorizedFiles,
    },
  };
}

/**
 * Sort products by their folder name alphabetically.
 */
export function sortProducts(products: BulkProduct[]): BulkProduct[] {
  return [...products].sort((a, b) => a.sku.localeCompare(b.sku));
}
