import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "./r2";

/**
 * Single-flighted presigning.
 *
 * Within one server-side render, if multiple components request the same
 * image key simultaneously, only one actual R2 presign request fires. The
 * others wait on a shared pending promise. The key is dropped from the map
 * as soon as the presign finishes (successfully or with an error), so a
 * *different* render pass (or the next request) presigns fresh — never
 * reuses a stale signature. This avoids redundant R2 signing calls while
 * guaranteeing every read gets a brand-new URL.
 */
const activePresigns = new Map<string, Promise<string>>();

function findActivePresign(key: string): Promise<string> | undefined {
  return activePresigns.get(key);
}

function registerActivePresign(
  key: string,
  promise: Promise<string>,
): void {
  activePresigns.set(key, promise);
}

function unregisterActivePresign(key: string): void {
  activePresigns.delete(key);
}

/**
 * Presign an R2 object key with single-flighting.
 *
 * No TTL cache, no in-memory signature reuse. Every read signs fresh so the
 * 24 h presigned URL never outlives the per-read expiry window.
 */
export async function createDownloadUrl(key: string): Promise<string> {
  // If a presign for this key is already in flight, share the pending promise.
  const active = findActivePresign(key);
  if (active) return active;

  // Kick off the actual presign. The wrapper (below) drops the key from the
  // map as soon as it settles, whether we succeeded or errored.
  const presign = getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
    {
      expiresIn: 86400,
    },
  );

  const running = (async () => {
    try {
      return await presign;
    } finally {
      unregisterActivePresign(key);
    }
  })();

  registerActivePresign(key, running);
  return running;
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
