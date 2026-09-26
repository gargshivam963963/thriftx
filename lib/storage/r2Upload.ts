import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "./r2";

export async function createUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    {
      expiresIn: 3600,
    },
  );
}
