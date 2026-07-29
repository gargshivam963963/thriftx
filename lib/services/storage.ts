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
