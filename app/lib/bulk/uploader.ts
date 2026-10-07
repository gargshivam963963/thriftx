import {
  ProductUploadError,
  uploadProduct,
} from "@/lib/services/uploadProduct";

import { BulkProduct } from "./types";

export interface UploadProgress {
  total: number;
  current: number;
  percentage: number;
  currentSku: string;
}

export interface UploadResult {
  success: BulkProduct[];
  failed: BulkProduct[];
}

/**
 * Max products created in parallel.
 * Low enough to keep the API and R2 happy, high enough that a long queue
 * finishes quickly — while other rows stay fully editable mid-run.
 */
export const UPLOAD_CONCURRENCY = 3;

/**
 * Run `worker` over `items` with at most `limit` in flight at a time,
 * preserving completion-order callbacks (each worker resolves independently).
 */
export async function runWithConcurrency<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;

  const bound = Math.max(1, Math.min(limit, items.length));
  let cursor = 0;

  const runner = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: bound }, () => runner()),
  );
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Create a single product.
 *
 * Returns the product with its outcome applied:
 *  - `status: "Uploaded"` on success (with `productId` set)
 *  - `status: "Invalid"` + an appended error on failure
 *
 * Preview object URLs are intentionally kept alive so the admin can still see
 * the row they just created; they are revoked when the row is deleted.
 */
export async function uploadSingleProduct(
  product: BulkProduct,
): Promise<BulkProduct> {
  if (product.status === "Uploaded") return product;

  if (product.status !== "Ready") {
    return { ...product, status: "Invalid" };
  }

  try {
    const result = await uploadProduct({
      form: {
        title: product.title,
        brand: product.brand,
        slug: `${slugify(product.title)}-${slugify(product.sku)}`,
        gender: product.gender,
        category: product.category,
        categorySlug: product.categorySlug || slugify(product.category),

        price: String(product.price),

        retailPrice:
          product.retailPrice !== undefined
            ? String(product.retailPrice)
            : "",

        condition: product.condition,
        size: product.size,

        chest: product.chest ?? "",
        waist: product.waist ?? "",
        length: product.length ?? "",

        color: product.color ?? "",
        material: product.material ?? "",

        description: product.description ?? "",
        shippingInfo: product.shippingInfo ?? "",
      },

      images: product.imageFiles,
      primaryIndex: 0,
      productId: product.productId,
    });

    return {
      ...product,
      productId: result.productId,
      status: "Uploaded",
      errors: [],
    };
  } catch (error) {
    return {
      ...product,
      ...(error instanceof ProductUploadError && error.productId
        ? { productId: error.productId }
        : {}),
      status: "Invalid",
      errors: [
        ...product.errors,
        error instanceof Error ? error.message : "Upload failed.",
      ],
    };
  }
}

interface UploadOptions {
  products: BulkProduct[];
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Create many products with bounded parallelism.
 * Products are never blocked from being edited while this runs — each row's
 * result is pushed back independently as it finishes.
 */
export async function uploadProducts({
  products,
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  const success: BulkProduct[] = [];
  const failed: BulkProduct[] = [];

  const total = products.length;
  let completed = 0;

  await runWithConcurrency(
    products,
    UPLOAD_CONCURRENCY,
    async (product) => {
      try {
        const outcome = await uploadSingleProduct(product);

        if (outcome.status === "Uploaded") {
          success.push(outcome);
        } else {
          failed.push(outcome);
        }
      } finally {
        completed += 1;
        onProgress?.({
          total,
          current: completed,
          percentage: Math.round((completed / total) * 100),
          currentSku: product.sku,
        });
      }
    },
  );

  return {
    success,
    failed,
  };
}

