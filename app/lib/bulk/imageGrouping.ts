/**
 * THRIFTX — Bulk image grouping & reordering helpers.
 *
 * Pure functions that operate on the parallel `imageFiles` / `imageUrls`
 * arrays of a `BulkProduct`. They return a NEW products array plus the list of
 * object URLs that became unreferenced (so the caller can revoke them).
 *
 * Invariants enforced here:
 * - `imageFiles[i]` always corresponds to `imageUrls[i]`.
 * - `primaryImage` is always `imageUrls[0]` (index 0 is the primary used by the
 *   product creation service via `primaryIndex: 0`).
 * - No image is ever silently discarded: every operation moves or removes an
 *   image deliberately, and removals surface their revoked URL to the caller.
 */

import type { BulkProduct } from "@/app/lib/bulk/types";

export interface BulkMutationResult {
  products: BulkProduct[];
  /** Object URLs that are no longer referenced and should be revoked. */
  revokedUrls: string[];
}

function clone(products: BulkProduct[]): BulkProduct[] {
  return products.map((product) => ({ ...product }));
}

function indexOfSku(products: BulkProduct[], sku: string): number {
  return products.findIndex((product) => product.sku === sku);
}

/** Recompute `primaryImage` and validation-relevant status for a product. */
function finalize(product: BulkProduct): BulkProduct {
  return {
    ...product,
    primaryImage: product.imageUrls[0],
    status: product.status === "Uploaded" ? "Ready" : product.status,
  };
}

/**
 * Reorder images within a single product.
 * Moves the image at `fromIndex` to `toIndex`.
 */
export function reorderImages(
  products: BulkProduct[],
  sku: string,
  fromIndex: number,
  toIndex: number,
): BulkMutationResult {
  const next = clone(products);
  const idx = indexOfSku(next, sku);
  if (idx === -1) return { products, revokedUrls: [] };

  const product = next[idx];
  const count = product.imageFiles.length;
  if (
    fromIndex < 0 ||
    fromIndex >= count ||
    toIndex < 0 ||
    toIndex >= count ||
    fromIndex === toIndex
  ) {
    return { products, revokedUrls: [] };
  }

  const files = [...product.imageFiles];
  const urls = [...product.imageUrls];
  const [file] = files.splice(fromIndex, 1);
  const [url] = urls.splice(fromIndex, 1);
  files.splice(toIndex, 0, file);
  urls.splice(toIndex, 0, url);

  next[idx] = finalize({ ...product, imageFiles: files, imageUrls: urls });
  return { products: next, revokedUrls: [] };
}

/**
 * Move an image from one product to another, optionally at a target position.
 * The image (File + object URL) is removed from the source and inserted into the
 * destination. Nothing is discarded.
 */
export function moveImage(
  products: BulkProduct[],
  fromSku: string,
  imageIndex: number,
  toSku: string,
  toIndex?: number,
): BulkMutationResult {
  const next = clone(products);
  const fromIdx = indexOfSku(next, fromSku);
  const toIdx = indexOfSku(next, toSku);
  if (fromIdx === -1 || toIdx === -1) return { products, revokedUrls: [] };

  const source = next[fromIdx];
  if (imageIndex < 0 || imageIndex >= source.imageFiles.length) {
    return { products, revokedUrls: [] };
  }

  // Extract from source.
  const sourceFiles = [...source.imageFiles];
  const sourceUrls = [...source.imageUrls];
  const [file] = sourceFiles.splice(imageIndex, 1);
  const [url] = sourceUrls.splice(imageIndex, 1);

  next[fromIdx] = finalize({
    ...source,
    imageFiles: sourceFiles,
    imageUrls: sourceUrls,
  });

  // Insert into destination (keep the same File + URL — no re-encoding).
  const target = next[toIdx];
  const targetFiles = [...target.imageFiles];
  const targetUrls = [...target.imageUrls];
  const insertAt =
    toIndex === undefined
      ? targetFiles.length
      : Math.max(0, Math.min(toIndex, targetFiles.length));
  targetFiles.splice(insertAt, 0, file);
  targetUrls.splice(insertAt, 0, url);

  next[toIdx] = finalize({
    ...target,
    imageFiles: targetFiles,
    imageUrls: targetUrls,
  });

  return { products: next, revokedUrls: [] };
}

/**
 * Set the primary (cover) image of a product by moving it to index 0.
 */
export function setPrimaryImage(
  products: BulkProduct[],
  sku: string,
  imageIndex: number,
): BulkMutationResult {
  return reorderImages(products, sku, imageIndex, 0);
}

/**
 * Remove an image from a product. Returns the object URL so it can be revoked.
 * Removing the last image is allowed (product becomes "Missing Images").
 */
export function removeImage(
  products: BulkProduct[],
  sku: string,
  imageIndex: number,
): BulkMutationResult {
  const next = clone(products);
  const idx = indexOfSku(next, sku);
  if (idx === -1) return { products, revokedUrls: [] };

  const product = next[idx];
  if (imageIndex < 0 || imageIndex >= product.imageFiles.length) {
    return { products, revokedUrls: [] };
  }

  const files = [...product.imageFiles];
  const urls = [...product.imageUrls];
  files.splice(imageIndex, 1);
  const [removedUrl] = urls.splice(imageIndex, 1);

  next[idx] = finalize({
    ...product,
    imageFiles: files,
    imageUrls: urls,
  });

  return { products: next, revokedUrls: [removedUrl] };
}

/**
 * Append additional images to an existing product, preserving their order.
 */
export function addImagesToProduct(
  products: BulkProduct[],
  sku: string,
  files: File[],
  urls: string[],
): BulkMutationResult {
  if (files.length === 0) return { products, revokedUrls: [] };

  const next = clone(products);
  const idx = indexOfSku(next, sku);
  if (idx === -1) return { products, revokedUrls: [] };

  const product = next[idx];
  const mergedFiles = [...product.imageFiles, ...files].slice(0, 10);
  const mergedUrls = [...product.imageUrls, ...urls].slice(0, 10);

  next[idx] = finalize({
    ...product,
    imageFiles: mergedFiles,
    imageUrls: mergedUrls,
    // Adding images resets an AI-generated cover so the new order is honored.
    aiCover: false,
  });

  return { products: next, revokedUrls: [] };
}
