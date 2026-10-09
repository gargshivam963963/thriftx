import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "./r2";

/**
 * Presigned URLs are costly to compute and are valid for a long time, so we
 * keep a small in-process TTL cache. This avoids re-signing the same image on
 * every render (home, shop, product, similar, recently-viewed), which is a
 * significant server-side cost on image-heavy pages.
 */
const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 min (signature is valid for 24 h)
const urlCache = new Map<string, { url: string; expiresAt: number }>();

export async function createDownloadUrl(key: string): Promise<string> {
  const now = Date.now();
  const cached = urlCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  const url = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
    {
      expiresIn: 86400,
    },
  );

  urlCache.set(key, { url, expiresAt: now + SIGNED_URL_TTL_MS });

  // Keep the cache bounded: drop expired entries if it grows too large.
  if (urlCache.size > 2000) {
    for (const [cachedKey, cachedValue] of urlCache) {
      if (cachedValue.expiresAt <= now) {
        urlCache.delete(cachedKey);
      }
    }
  }

  return url;
}

export async function createProductImageUrl(value: string): Promise<string> {
  if (!value || value.startsWith("/") || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("products/")) {
    // A single bad image (missing R2 env, expired creds, network blip)
    // must NEVER blank the whole grid — fall back to the raw key so the
    // card still renders instead of `Promise.all` rejecting everything.
    try {
      return await createDownloadUrl(value);
    } catch (error) {
      console.error("[r2] failed to sign product image, using raw key:", error);
      return value;
    }
  }

  return value;
}
