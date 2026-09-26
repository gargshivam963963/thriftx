import "dotenv/config";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "../lib/storage/r2";

const key = "test/connection-test.txt";

async function main() {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: "THRIFTX R2 connection test",
      ContentType: "text/plain",
    }),
  );

  console.log("R2 upload successful");

  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  );

  console.log("R2 delete successful");
}

main().catch((error) => {
  console.error("R2 test failed:", error);
  process.exit(1);
});
