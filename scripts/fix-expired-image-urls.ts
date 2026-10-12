/**
 * One-off repair: rewrite `ProductImage` rows that stored a full presigned R2
 * URL back to the durable `products/...` object key.
 *
 * Presigned URLs expire 24 h after signing, after which R2 returns 403 for
 * every request (including `/_next/image` optimizations), so those product
 * images break permanently. The raw key is what should live in the DB —
 * `createProductImageUrl` re-signs it fresh on each read.
 *
 * Each row is only rewritten after the extracted key is verified to exist in
 * the bucket (a missing object keeps the row untouched so we never swap one
 * failure mode for another). Idempotent.
 *
 * Usage: npx tsx scripts/fix-expired-image-urls.ts
 */
import "dotenv/config";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "../lib/storage/r2";
import { normalizeProductImageKey } from "../lib/storage/r2Download";
import { prisma } from "../lib/prisma";

async function objectExists(key: string): Promise<boolean> {
  const url = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: getR2BucketName(), Key: key }),
    { expiresIn: 300 },
  );
  try {
    const res = await fetch(url, { method: "GET" });
    void res.body?.cancel();
    return res.status === 200;
  } catch (error) {
    console.error(`fetch failed for ${key}`, error);
    return false;
  }
}

async function main() {
  if (!prisma) {
    console.error("Database is not configured (DATABASE_URL missing).");
    process.exit(1);
  }

  const rows = await prisma.productImage.findMany({
    where: { url: { startsWith: "http" } },
    select: { id: true, productId: true, url: true },
  });
  console.log(`Found ${rows.length} image row(s) storing a full URL.\n`);

  let fixed = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = normalizeProductImageKey(row.url);
    if (key === row.url) {
      console.log(`SKIP (not an R2 product URL): ${row.url.slice(0, 100)}`);
      skipped += 1;
      continue;
    }

    if (await objectExists(key)) {
      await prisma.productImage.update({
        where: { id: row.id },
        data: { url: key },
      });
      console.log(`FIXED ${row.productId}: ${key}`);
      fixed += 1;
    } else {
      console.log(
        `MISSING OBJECT (left untouched) ${row.productId}: ${key}`,
      );
      skipped += 1;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, skipped: ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("fix failed:", error);
  process.exit(1);
});
