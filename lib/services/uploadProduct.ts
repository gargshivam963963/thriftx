"use client";

import { uploadImages, UploadedImage } from "./storage";
import { compressImages } from "./imageCompression";

export interface UploadProductInput {
  form: Record<string, string>;
  images: File[];
  primaryIndex: number;
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
}: UploadProductInput) {
  // Required fields
  if (!form.title || !form.category || !form.gender || !form.price) {
    throw new Error("Please fill in all required product fields.");
  }

  if (images.length === 0) {
    throw new Error("Please upload at least one image.");
  }

  // Compress images on the client before upload (max 1024px, q0.8, WebP).
  const compressed = await compressImages(images);
  const compressedFiles = compressed.map(
    (c) => new File([c.file], "product-image", { type: c.mimeType }),
  );

  // Upload images
  const uploadedImages: UploadedImage[] = await uploadImages(compressedFiles);

  const imageUrls = uploadedImages.map((image) => image.url);

  const primaryImage = imageUrls[primaryIndex] ?? imageUrls[0];

  // Product payload
  const payload = {
    ...form,

    // Slugs
    slug: slugify(form.title),
    categorySlug: slugify(form.category),

    // Pricing
    price: Number(form.price),

    retailPrice:
      form.retailPrice?.trim() !== "" ? Number(form.retailPrice) : undefined,

    // Images
    primaryImage,
    images: imageUrls,

    // Status
    status: "active",
    isActive: true,
  };

  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };
  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to create product");
  }

  return result;
}
