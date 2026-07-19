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
