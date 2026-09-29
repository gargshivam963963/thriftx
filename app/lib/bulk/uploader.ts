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

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface UploadOptions {
  products: BulkProduct[];
  onProgress?: (progress: UploadProgress) => void;
}

export async function uploadProducts({
  products,
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  const success: BulkProduct[] = [];
  const failed: BulkProduct[] = [];

  const total = products.length;

  for (let index = 0; index < total; index++) {
    const product = products[index];

    onProgress?.({
      total,
      current: index + 1,
      percentage: Math.round(((index + 1) / total) * 100),
      currentSku: product.sku,
    });

    if (product.status === "Uploaded") {
      success.push(product);
      continue;
    }

    if (product.status !== "Ready") {
      failed.push({
        ...product,
        status: "Invalid",
      });

      continue;
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

      for (const url of [...product.imageUrls, product.primaryImage ?? ""]) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }

      success.push({
        ...product,
        productId: result.productId,
        imageFiles: [],
        imageUrls: [],
        primaryImage: undefined,
        status: "Uploaded",
        errors: [],
      });
    } catch (error) {
      failed.push({
        ...product,
        ...(error instanceof ProductUploadError && error.productId
          ? { productId: error.productId }
          : {}),
        status: "Invalid",
        errors: [
          ...product.errors,
          error instanceof Error ? error.message : "Upload failed.",
        ],
      });
    }
  }

  return {
    success,
    failed,
  };
}
