"use client";

import { Client, Storage, ID } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

const storage = new Storage(client);

const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export interface UploadedImage {
  fileId: string;
  url: string;
}

/**
 * Upload image Files to Appwrite Storage.
 * Images should be compressed (see `imageCompression.ts`) before calling.
 */
export async function uploadImages(images: File[]): Promise<UploadedImage[]> {
  const uploaded: UploadedImage[] = [];

  for (const image of images) {
    const file = await storage.createFile(bucketId, ID.unique(), image);

    uploaded.push({
      fileId: file.$id,
      url: storage.getFileView(bucketId, file.$id).toString(),
    });
  }

  return uploaded;
}

/**
 * Upload an array of compressed Blobs to Appwrite Storage.
 * Assumes the caller has already compressed/resized the images.
 */
export async function uploadBlobs(
  blobs: Blob[],
  mimeType = "image/jpeg",
): Promise<UploadedImage[]> {
  const files = blobs.map(
    (blob, i) =>
      new File([blob], `image-${i + 1}.${mimeType.split("/")[1] || "jpg"}`, {
        type: blob.type || mimeType,
      }),
  );
  return uploadImages(files);
}

/**
 * Parses a fileId from an Appwrite image URL.
 * Appwrite view URLs contain the file ID after the bucket ID.
 * e.g. https://cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view
 */
export function extractFileIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/files\/([^/]+)\/view/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function deleteImageFromStorage(
  imageUrl: string,
): Promise<boolean> {
  try {
    const fileId = extractFileIdFromUrl(imageUrl);
    if (!fileId) return false;
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (error) {
    console.error("deleteImageFromStorage error:", error);
    return false;
  }
}
