import fs from "fs";
import path from "path";

import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { storage, APPWRITE } from "./appwrite";

export interface UploadedImages {
  primaryImage: string;
  images: string[];
}

export async function uploadImages(
  sku: string,
  imageFolder: string,
): Promise<UploadedImages> {
  const files = fs
    .readdirSync(imageFolder)
    .filter((file) => file.startsWith(`${sku}-`))
    .sort();

  if (!files.length) {
    throw new Error(`No images found for ${sku}`);
  }

  const uploaded: string[] = [];

  for (const file of files) {
    const uploadedFile = await storage.createFile(
      APPWRITE.BUCKET_ID,
      ID.unique(),
      InputFile.fromPath(path.join(imageFolder, file)),
    );

    uploaded.push(uploadedFile.$id);
  }

  return {
    primaryImage: uploaded[0],
    images: uploaded,
  };
}
