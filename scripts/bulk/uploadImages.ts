import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2BucketName, getR2Client } from "../../lib/storage/r2";

export interface UploadedImages {
  primaryImage: string;
  images: string[];
}

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function uploadImages(
  sku: string,
  imageFolder: string,
): Promise<UploadedImages> {
  const filenames = (await readdir(imageFolder))
    .filter((filename) => {
      const name = path.parse(filename).name;
      return name.startsWith(`${sku}-`);
    })
    .sort((left, right) => {
      const leftIndex = Number(path.parse(left).name.slice(sku.length + 1));
      const rightIndex = Number(path.parse(right).name.slice(sku.length + 1));
      return leftIndex - rightIndex || left.localeCompare(right);
    });

  if (filenames.length === 0) {
    throw new Error(`No images found for product ${sku}`);
  }

  const client = getR2Client();
  const bucket = getR2BucketName();
  const imageKeys = await Promise.all(
    filenames.map(async (filename) => {
      const extension = path.extname(filename).toLowerCase();
      const contentType = CONTENT_TYPES[extension];
      if (!contentType) {
        throw new Error(`Unsupported image type for ${filename}`);
      }

      const key = `products/${sku}/${filename}`;
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: await readFile(path.join(imageFolder, filename)),
          ContentType: contentType,
        }),
      );
      return key;
    }),
  );

  return {
    primaryImage: imageKeys[0],
    images: imageKeys,
  };
}
