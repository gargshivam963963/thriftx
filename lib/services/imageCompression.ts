"use client";

/**
 * THRIFTX — Client-side Image Compression
 *
 * Compresses and resizes images BEFORE upload to Appwrite Storage.
 * - Max width 1024px
 * - JPEG quality 0.80
 * - Preserves aspect ratio
 * - Strips EXIF/GPS metadata (canvas redraw discards it)
 * - Uses WebP when the browser supports it
 *
 * This dramatically reduces upload size and eliminates the
 * 413 / FUNCTION PAYLOAD TOO LARGE errors on the AI endpoint,
 * because we only ever send Appwrite URLs — never Base64.
 */

import type { CompressionOptions, CompressedImage } from "@/lib/ai/types";

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1024,
  quality: 0.8,
  preferWebp: true,
};

/** Allowed image MIME types. */
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/** Max source file size (40MB) before compression. */
const MAX_SOURCE_BYTES = 40 * 1024 * 1024;

/** Detect WebP support once and cache it. */
let webpSupportCache: boolean | null = null;

function supportsWebp(): boolean {
  if (webpSupportCache !== null) return webpSupportCache;
  if (typeof window === "undefined") {
    webpSupportCache = false;
    return false;
  }
  const canvas = document.createElement("canvas");
  webpSupportCache = canvas
    .toDataURL("image/webp")
    .startsWith("data:image/webp");
  return webpSupportCache;
}

/** Validate a candidate image file before processing. */
export function validateImageFile(
  file: File,
  maxCount: number,
): { valid: boolean; reason?: string } {
  if (!file) {
    return { valid: false, reason: "No file provided." };
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      reason: `Unsupported file type "${file.type || "unknown"}". Use JPEG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_SOURCE_BYTES) {
    return {
      valid: false,
      reason: "Image is too large to process.",
    };
  }

  if (maxCount > 10) {
    return { valid: false, reason: "Maximum 10 images per product." };
  }

  return { valid: true };
}

/**
 * Loads a File into an HTMLImageElement.
 * HEIC/HEIF will be decoded by the browser if supported.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image."));
    };
    img.src = url;
  });
}

/**
 * Compress a single image File.
 * Returns a Blob + object URL + dimensions.
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
): Promise<CompressedImage> {
  const config: CompressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const img = await loadImage(file);

  // Preserve aspect ratio, cap at maxWidth.
  const scale = Math.min(1, config.maxWidth / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  // White background (avoids black transparency in JPEG).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const useWebp = config.preferWebp && supportsWebp();
  const mimeType = useWebp ? "image/webp" : "image/jpeg";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Image compression failed."));
      },
      mimeType,
      config.quality,
    );
  });

  return {
    file: blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    sizeBytes: blob.size,
    mimeType,
  };
}

/**
 * Compress an array of image Files sequentially.
 * Returns compressed results in the same order.
 */
export async function compressImages(
  files: File[],
  options: Partial<CompressionOptions> = {},
): Promise<CompressedImage[]> {
  const results: CompressedImage[] = [];
  for (const file of files) {
    results.push(await compressImage(file, options));
  }
  return results;
}

export { ACCEPTED_TYPES, MAX_SOURCE_BYTES };
