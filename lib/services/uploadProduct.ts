"use client";

import { compressImages } from "./imageCompression";
import { uploadImageToR2 } from "./r2Upload";

export interface UploadProductInput {
  form: Record<string, string>;
  images: File[];
  primaryIndex: number;
  productId?: string;
}

export class ProductUploadError extends Error {
  constructor(
    message: string,
    readonly productId?: string,
  ) {
    super(message);
    this.name = "ProductUploadError";
  }
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function uploadProduct({
  form,
  images,
  primaryIndex,
  productId: existingProductId,
}: UploadProductInput) {
  // Required fields
  if (!form.title || !form.category || !form.gender || !form.price) {
    throw new Error("Please fill in all required product fields.");
  }

  if (images.length === 0) {
    throw new Error("Please upload at least one image.");
  }

  const payload = {
    ...form,
    slug: form.slug?.trim() || slugify(form.title),
    categorySlug: form.categorySlug?.trim() || slugify(form.category),
    price: Number(form.price),
    retailPrice:
      form.retailPrice?.trim() !== "" ? Number(form.retailPrice) : undefined,
  };

  let productId = existingProductId;
  try {
    if (!productId) {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.productId !== "string") {
        throw new Error(result?.message ?? "Failed to create product draft");
      }
      productId = result.productId;
    }

    if (!productId) throw new Error("Product draft ID is unavailable");
    const resolvedProductId = productId;
    const compressed = await compressImages(images);
    const keys: string[] = [];
    try {
      for (const [position, image] of compressed.entries()) {
        const file = new File(
          [image.file],
          `product-image-${position + 1}.${image.mimeType.split("/")[1] || "jpg"}`,
          { type: image.mimeType },
        );
        keys.push(
          (await uploadImageToR2(file, resolvedProductId, position)).key,
        );
      }
    } finally {
      compressed.forEach((image) => URL.revokeObjectURL(image.url));
    }

    if (primaryIndex > 0 && primaryIndex < keys.length) {
      keys.unshift(...keys.splice(primaryIndex, 1));
    }

    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: resolvedProductId,
        data: { ...payload, images: keys, status: "active", isActive: true },
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      throw new Error(result?.message ?? "Failed to finalize product");
    }

    return { productId: resolvedProductId, imageKeys: keys };
  } catch (error) {
    throw new ProductUploadError(
      error instanceof Error ? error.message : "Product upload failed",
      productId,
    );
  }
}
