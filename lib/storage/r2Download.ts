import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "./r2";

export async function createDownloadUrl(key: string) {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
    {
      expiresIn: 86400,
    },
  );
}

export async function createProductImageUrl(value: string): Promise<string> {
  if (!value || value.startsWith("/") || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("products/")) {
    return createDownloadUrl(value);
  }

  return value;
}
