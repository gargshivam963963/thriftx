import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getR2Config() {
  const endpoint = getRequiredEnv("R2_ENDPOINT");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  const bucketName = getRequiredEnv("R2_BUCKET_NAME");

  client ??= new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName };
}

export function getR2Client(): S3Client {
  return getR2Config().client;
}

export function getR2BucketName(): string {
  return getR2Config().bucketName;
}
