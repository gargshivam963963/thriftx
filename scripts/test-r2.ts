import "dotenv/config";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2BucketName, getR2Client } from "../lib/storage/r2";

const key = "test/connection-test.txt";

async function main() {
  const r2 = getR2Client();
  const bucketName = getR2BucketName();

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: "THRIFTX R2 connection test",
      ContentType: "text/plain",
    }),
  );

  console.log("R2 upload successful");

  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  console.log("R2 delete successful");
}

main().catch((error) => {
  console.error("R2 test failed:", error);
  process.exit(1);
});
