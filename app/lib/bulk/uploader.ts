import { uploadProduct } from "@/lib/services/uploadProduct";

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

    if (product.status !== "Ready") {
      failed.push({
        ...product,
        status: "Invalid",
      });

      continue;
    }

    try {
      await uploadProduct({
        form: {
          title: product.title,
          brand: product.brand,
          gender: product.gender,
          category: product.category,

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
          inseam: product.inseam ?? "",

          color: product.color ?? "",
          material: product.material ?? "",

          description: product.description ?? "",
          shippingInfo: product.shippingInfo ?? "",
        },

        images: product.imageFiles,
        primaryIndex: 0,
      });

      success.push({
        ...product,
        imageUrls: [],
        primaryImage: product.imageFiles[0]
          ? URL.createObjectURL(product.imageFiles[0])
          : undefined,
        status: "Uploaded",
      });
    } catch (error) {
      failed.push({
        ...product,
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
