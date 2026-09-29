"use client";

import type { BulkProduct } from "@/app/lib/bulk/types";

const STORAGE_PREFIX = "thriftx_spreadsheet_";
const DRAFT_KEY = STORAGE_PREFIX + "draft";
const AUTO_SAVE_DEBOUNCE = 500; // ms

type DraftData = {
  products: BulkProduct[];
  nextSkuNumber: number;
  lastSaved: number;
};

function generateSku(index: number): string {
  return `TX${String(index).padStart(3, "0")}`;
}

/**
 * Load draft products from localStorage.
 */
export function loadDraft(): DraftData {
  if (typeof window === "undefined") {
    return { products: [], nextSkuNumber: 1, lastSaved: Date.now() };
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DraftData;

      const rehydrated = parsed.products.map((product) => {
        const savedImageCount = Number(
          (product as BulkProduct & { _savedImageCount?: number })
            ._savedImageCount ??
            product.imageUrls?.length ??
            0,
        );
        if (product.status === "Uploaded" && product.productId) {
          return {
            ...product,
            imageFiles: [],
            imageUrls: [],
            primaryImage: undefined,
            errors: [],
          };
        }

        return {
          ...product,
          imageFiles: [],
          imageUrls: [],
          primaryImage: undefined,
          status:
            savedImageCount > 0 ? ("Missing Images" as const) : product.status,
          errors:
            savedImageCount > 0
              ? [
                  ...product.errors,
                  "Select the image files again to continue this draft.",
                ]
              : product.errors,
        };
      });

      return {
        products: rehydrated,
        nextSkuNumber: parsed.nextSkuNumber,
        lastSaved: parsed.lastSaved,
      };
    }
  } catch (e) {
    console.warn("Failed to load spreadsheet draft:", e);
  }

  return { products: [], nextSkuNumber: 1, lastSaved: Date.now() };
}

/**
 * Save draft products to localStorage.
 * Note: File objects are NOT serializable. We save imageUrls only.
 */
export function saveDraft(
  products: BulkProduct[],
  nextSkuNumber?: number,
): void {
  if (typeof window === "undefined") return;

  try {
    // Strip File objects (not serializable) — keep only URL metadata
    const serializable = products.map((p) => ({
      ...p,
      imageFiles: [], // can't store File objects
      imageUrls: [],
      primaryImage: undefined,
      _savedImageCount: p.imageFiles.length,
    }));

    const data: DraftData = {
      products: serializable,
      nextSkuNumber: nextSkuNumber ?? products.length + 1,
      lastSaved: Date.now(),
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save spreadsheet draft:", e);
  }
}

/**
 * Clear all draft data.
 */
export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Create a blank product row.
 */
export function createBlankProduct(skuNumber: number): BulkProduct {
  return {
    row: skuNumber,
    sku: generateSku(skuNumber),
    title: "",
    brand: "",
    slug: "",
    gender: "Unisex",
    category: "",
    categorySlug: "",
    price: 0,
    condition: "Excellent",
    size: "",
    chest: "",
    waist: "",
    length: "",
    color: "",
    material: "",
    description: "",
    shippingInfo: "",
    imageFiles: [],
    imageUrls: [],
    aiGenerated: false,
    status: "Missing Images",
    errors: ["Add at least one image."],
  };
}

export { generateSku };
