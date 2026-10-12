/**
 * Diagnostic: verify every ProductImage row resolves to an object that R2
 * actually serves. Catches the two classic causes of `/_next/image` 403s:
 *   1. rows storing an already-presigned (expiring) URL instead of a raw key,
 *   2. rows pointing at a key whose object no longer exists in the bucket
 *      (S3/R2 returns 403 AccessDenied for missing objects under SigV4).
 *
 * Usage: npx tsx scripts/check-r2-images.ts
 */
import "dotenv/config";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "../lib/storage/r2";
import { prisma } from "../lib/prisma";

async function main() {
  if (!prisma) {
    console.error("Database is not configured (DATABASE_URL missing).");
    process.exit(1);
  }

  const images = await prisma.productImage.findMany({
    select: { id: true, url: true, productId: true },
    orderBy: { id: "asc" },
  });
  console.log(`Checking ${images.length} ProductImage rows...\n`);

  const presignedRows: string[] = [];
  const missing: string[] = [];
  const failed: { key: string; status: number }[] = [];

  for (const image of images) {
    const key = image.url;
    if (/^https?:\/\//i.test(key)) {
      presignedRows.push(`${image.productId} :: ${key.slice(0, 120)}...`);
      continue;
    }
    if (!key.startsWith("products/")) continue;

    const url = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({ Bucket: getR2BucketName(), Key: key }),
      { expiresIn: 300 },
    );

    try {
      const res = await fetch(url, { method: "GET" });
      void res.body?.cancel();
      if (res.status === 403 || res.status === 404) {
        if (res.status === 403) missing.push(key);
        else failed.push({ key, status: res.status });
      } else if (res.status !== 200) {
        failed.push({ key, status: res.status });
      }
    } catch (error) {
      failed.push({ key, status: -1 });
      console.error(`fetch error for ${key}`, error);
    }
  }

  console.log(`\nRows storing full http(s) URLs (will expire -> 403): ${presignedRows.length}`);
  presignedRows.forEach((row) => console.log(`  - ${row}`));

  console.log(`\nKeys returning 403 (likely missing objects): ${missing.length}`);
  missing.forEach((key) => console.log(`  - ${key}`));

  console.log(`\nOther non-200: ${failed.length}`);
  failed.forEach(({ key, status }) => console.log(`  - [${status}] ${key}`));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("check failed:", error);
  process.exit(1);
});
