"use client";

/**
 * THRIFTX — Centralized AI Fill Service
 *
 * Production pipeline:
 *   validate → compress (client) → upload (Appwrite) → POST URLs only
 *
 * Features:
 * - Payload validation (count, file type, size)
 * - Automatic client-side compression (max 1024px, q0.8, WebP, strip EXIF)
 * - Uploads to Appwrite Storage, then sends ONLY public URLs
 * - Request dedup (in-flight guard) — prevents concurrent AI requests
 * - Retry with exponential backoff (max 2, network/timeout only)
 * - Never retries validation errors
 * - Structured logging (durations, image count, request size, retry count)
 * - Never logs Base64 or sensitive data
 */

import type {
  AIFillProgress,
  AIFillResult,
  AIFillErrorCode,
  CompressedImage,
} from "@/lib/ai/types";
import {
  validateImageFile,
  compressImage,
} from "@/lib/services/imageCompression";
import { uploadImages } from "@/lib/services/storage";
import { postAiFill, AIFillApiError } from "@/lib/services/aiApi";

/** Max images allowed per AI fill request. */
const MAX_IMAGES = 10;

/** Max retries for network / timeout errors. */
const MAX_RETRIES = 2;

/** Base delay in ms for exponential backoff. */
const BASE_RETRY_DELAY_MS = 800;

/** In-flight guard to prevent concurrent AI requests. */
let inFlight = false;

/** Map of SKU/product keys currently being processed (secondary guard). */
const inFlightKeys = new Set<string>();

/** Retryable network/timeout error codes (never validation). */
const RETRYABLE_CODES: AIFillErrorCode[] = [
  "NETWORK_ERROR",
  "TIMEOUT",
  "SERVER_ERROR",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic sleep with jitter for exponential backoff.
 */
function backoffDelay(attempt: number): number {
  const exp = Math.min(2 ** attempt, 8);
  return BASE_RETRY_DELAY_MS * exp + Math.round(Math.random() * 200);
}

/**
 * Validate a set of files before any network activity.
 * Returns a friendly error message or null when valid.
 */
function validateFiles(files: File[]): string | null {
  if (!files || files.length === 0) {
    return "Please upload at least one image first.";
  }

  if (files.length > MAX_IMAGES) {
    return `You can analyze up to ${MAX_IMAGES} images at a time.`;
  }

  for (const file of files) {
    const result = validateImageFile(file, MAX_IMAGES);
    if (!result.valid) return result.reason ?? "Invalid image file.";
  }

  return null;
}

/**
 * Validate Appwrite image URLs before sending to the AI endpoint.
 */
function validateImageUrls(urls: string[]): string | null {
  if (!urls || urls.length === 0) {
    return "No image URLs available. Please upload images first.";
  }

  if (urls.length > MAX_IMAGES) {
    return `You can analyze up to ${MAX_IMAGES} images at a time.`;
  }

  for (const url of urls) {
    if (typeof url !== "string" || !url.startsWith("http")) {
      return "Invalid image URL provided.";
    }
  }

  return null;
}

/**
 * Estimate the JSON payload byte size (for logging).
 */
function estimateRequestSize(urls: string[]): number {
  let size = 0;
  for (const url of urls) size += url.length + 2;
  size += 64; // overhead for productId/analyzeAllImages
  return size * 2; // UTF-16 → ~bytes
}

/**
 * Log structured AI fill telemetry. Never logs image binaries.
 */
function logFill(opts: {
  event: string;
  imageCount: number;
  durationMs?: number;
  requestSizeBytes?: number;
  retryCount?: number;
  code?: string;
  message?: string;
}) {
  const {
    event,
    imageCount,
    durationMs,
    requestSizeBytes,
    retryCount,
    code,
    message,
  } = opts;
  console.info(`[ai-fill] ${event}`, {
    imageCount,
    durationMs,
    requestSizeBytes,
    retryCount,
    code,
    message,
  });
}

/**
 * Run the full AI fill pipeline for a set of images.
 *
 * @param files       Raw image Files (new uploads).
 * @param opts        Pipeline options.
 * @param opts.key    Stable key for dedup (e.g. SKU or product id).
 * @param opts.productId  Optional existing product id.
 * @param opts.analyzeAllImages Whether to analyze all images (default primary/front only).
 * @param opts.onProgress  Progress callback.
 * @param opts.imageUrls   Pre-uploaded Appwrite URLs (skip upload step).
 */
export async function runAiFill(
  files: File[],
  opts: {
    key?: string;
    productId?: string;
    analyzeAllImages?: boolean;
    onProgress?: (p: AIFillProgress) => void;
    imageUrls?: string[];
  } = {},
): Promise<AIFillResult> {
  const {
    key,
    productId,
    analyzeAllImages = false,
    onProgress,
    imageUrls,
  } = opts;

  // ── Dedup: prevent concurrent AI requests ──
  if (key) {
    if (inFlightKeys.has(key)) {
      return {
        success: false,
        data: null,
        code: "CONFLICT",
        message: "AI Fill is already running for this product.",
      };
    }
    inFlightKeys.add(key);
  } else if (inFlight) {
    return {
      success: false,
      data: null,
      code: "CONFLICT",
      message: "AI Fill is already running. Please wait.",
    };
  }

  if (key) inFlight = true;

  const startedAt = Date.now();
  let retryCount = 0;

  try {
    // ── 1. Validate before any network call ──
    onProgress?.({
      stage: "validating",
      percent: 5,
      message: "Validating images...",
    });

    const validationError = imageUrls
      ? validateImageUrls(imageUrls)
      : validateFiles(files);

    if (validationError) {
      return {
        success: false,
        data: null,
        code: "VALIDATION",
        message: validationError,
      };
    }

    // ── 2. Compress on the client ──
    let urls = imageUrls ?? [];
    let compressed: CompressedImage[] = [];

    if (!imageUrls) {
      onProgress?.({
        stage: "compressing",
        percent: 20,
        message: "Optimizing images...",
      });
      const t0 = Date.now();
      compressed = [];
      for (const file of files) {
        compressed.push(await compressImage(file));
      }
      console.info(
        `[ai-fill] compressed ${compressed.length} images in ${Date.now() - t0}ms`,
      );

      // ── 3. Upload to Appwrite Storage ──
      onProgress?.({
        stage: "uploading",
        percent: 45,
        message: "Uploading to storage...",
      });
      const uploadStart = Date.now();
      const uploaded = await uploadImages(
        compressed.map(
          (c) => new File([c.file], "ai-image", { type: c.mimeType }),
        ),
      );
      console.info(
        `[ai-fill] uploaded ${uploaded.length} images in ${Date.now() - uploadStart}ms`,
      );
      urls = uploaded.map((u) => u.url);
    }

    const requestSizeBytes = estimateRequestSize(urls);

    // ── 4. POST to AI (URLs only, with retry for network/timeout) ──
    onProgress?.({
      stage: "analyzing",
      percent: 70,
      message: "Analyzing with AI...",
    });

    let response;
    while (true) {
      try {
        response = await postAiFill({
          productId,
          imageUrls: urls,
          analyzeAllImages,
        });
        break;
      } catch (err) {
        const code = err instanceof AIFillApiError ? err.code : "UNKNOWN";

        if (RETRYABLE_CODES.includes(code) && retryCount < MAX_RETRIES) {
          retryCount += 1;
          const waitMs = backoffDelay(retryCount - 1);
          console.warn(
            `[ai-fill] retry ${retryCount}/${MAX_RETRIES} after ${waitMs}ms (${code})`,
          );
          await delay(waitMs);
          continue;
        }

        // Non-retryable — rethrow.
        throw err;
      }
    }

    // ── 5. Validate AI response shape ──
    const totalMs = Date.now() - startedAt;
    if (!response || response.success !== true) {
      const err = response as { message?: string; code?: AIFillErrorCode };
      logFill({
        event: "failed",
        imageCount: urls.length,
        durationMs: totalMs,
        requestSizeBytes,
        retryCount,
        code: err.code ?? "AI_ERROR",
        message: err.message,
      });
      return {
        success: false,
        data: null,
        code: err.code ?? "AI_ERROR",
        message: err.message ?? "AI processing failed.",
      };
    }

    logFill({
      event: "complete",
      imageCount: urls.length,
      durationMs: totalMs,
      requestSizeBytes,
      retryCount,
      code: "OK",
    });

    return {
      success: true,
      data: response.data,
      code: "OK",
      message: "AI Fill complete.",
    };
  } catch (err) {
    const totalMs = Date.now() - startedAt;
    const code = err instanceof AIFillApiError ? err.code : "UNKNOWN";
    const message =
      err instanceof AIFillApiError
        ? err.message
        : "AI Fill failed. Please try again.";

    logFill({
      event: "error",
      imageCount: files.length || imageUrls?.length || 0,
      durationMs: totalMs,
      retryCount,
      code,
      message,
    });

    return {
      success: false,
      data: null,
      code,
      message,
    };
  } finally {
    if (key) inFlightKeys.delete(key);
    inFlight = false;
  }
}

export { MAX_IMAGES, MAX_RETRIES };
