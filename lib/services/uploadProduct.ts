"use client";

import { ID } from "appwrite";

import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
} from "@/lib/appwrite";

import { uploadImages, UploadedImage } from "./storage";

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

  // Upload images
  const uploadedImages: UploadedImage[] = await uploadImages(images);

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

  return await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    ID.unique(),
    payload,
  );
}
