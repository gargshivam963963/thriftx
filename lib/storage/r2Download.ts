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

/**
 * Normalize a stored image reference back to its durable R2 object key.
 *
 * Older admin saves persisted the FULL presigned URL
 * (`https://<account>.r2.cloudflarestorage.com/products/...?X-Amz-...`) into
 * `ProductImage.url` instead of the bare `products/...` key. Presignatures
 * expire after 24 h, after which R2 answers every request with 403 — so the
 * image (and every `/_next/image` derivative of it) breaks permanently.
 *
 * Extracting the pathname recovers the raw key so it can be re-signed fresh on
 * each read. Non-R2 URLs and local paths (`/images/...`) are returned as-is.
 */
export function normalizeProductImageKey(value: string): string {
  if (!/^https?:\/\//i.test(value)) return value;

  try {
    // URL.pathname keeps percent-encoding intact. R2 object keys can contain
    // encoded characters (e.g. %2F for /), which would make the
    // startsWith("products/") check miss the key. Decode the pathname
    // first so any presigned R2 URL is collapsed back to its durable
    // "products/..." key and re-signed fresh on every read. Non-R2 URLs
    // and local paths ("/images/...") are returned as-is.
    const decodedPathname = decodeURIComponent(new URL(value).pathname);
    const pathname = decodedPathname.replace(/^\//, "");
    return pathname.startsWith("products/") ? pathname : value;
  } catch {
    return value;
  }
}

export async function createProductImageUrl(rawValue: string): Promise<string> {
  const value = normalizeProductImageKey(rawValue);

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
