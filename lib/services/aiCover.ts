"use client";

/**
 * THRIFTX — AI Cover client service
 *
 * Compresses the front photo of a product and asks `/api/ai/cover` to return a
 * retail-ready main cover image (identical garment, clean studio backdrop).
 *
 * Deliberately fails soft: every error path throws `AICoverError` so the caller
 * can simply keep the original photo. Cover generation must NEVER block or break
 * a product upload.
 */

import { compressImage } from "@/lib/services/imageCompression";

/** Request timeout — image models are slower than text models. */
const DEFAULT_TIMEOUT_MS = 90_000;

/** Normalized, user-safe error codes. */
export type AICoverErrorCode =
  | "VALIDATION"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "AI_ERROR";

export class AICoverError extends Error {
  readonly code: AICoverErrorCode;

  constructor(code: AICoverErrorCode, message: string) {
    super(message);
    this.name = "AICoverError";
    this.code = code;
  }
}

function codeFromStatus(status: number): AICoverErrorCode {
  switch (status) {
    case 400:
    case 422:
      return "VALIDATION";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 429:
      return "RATE_LIMITED";
    case 504:
      return "TIMEOUT";
    default:
      return "AI_ERROR";
  }
}

/** Base64 → File (never logs the payload). */
function base64ToFile(base64: string, mimeType: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const extension = (mimeType.split("/")[1] || "png").toLowerCase();
  const safeType =
    mimeType.startsWith("image/") ? mimeType : "image/png";

  return new File([bytes], `ai-cover.${extension}`, {
    type: safeType,
  });
}

/**
 * Generate a main cover image for a single product photo.
 *
 * @param source The front / primary photo of the product.
 * @returns A `File` ready to be inserted at the front of the image list.
 * @throws {AICoverError} when generation is unavailable — callers should fall
 *                        back to the original photo.
 */
export async function generateCoverImage(
  source: File,
): Promise<File> {
  if (!source) {
    throw new AICoverError(
      "VALIDATION",
      "Please upload a product photo first.",
    );
  }

  const compressed = await compressImage(source, {
    maxWidth: 1024,
    quality: 0.85,
    preferWebp: true,
  });

  try {
    const extension =
      compressed.mimeType.split("/")[1] || "webp";

    const formData = new FormData();
    formData.append(
      "images",
      new File([compressed.file], `cover-source.${extension}`, {
        type: compressed.mimeType,
      }),
    );

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await fetch("/api/ai/cover", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const json = (payload ?? {}) as {
        success?: boolean;
        message?: string;
        code?: AICoverErrorCode;
        data?: { mimeType?: string; data?: string };
      };

      if (!response.ok || json.success !== true) {
        throw new AICoverError(
          json.code ?? codeFromStatus(response.status),
          json.message ??
            "Cover generation failed. The original photo is used instead.",
        );
      }

      const base64 = json.data?.data;
      if (!base64) {
        throw new AICoverError(
          "AI_ERROR",
          "No cover image was returned.",
        );
      }

      return base64ToFile(
        base64,
        json.data?.mimeType || "image/png",
      );
    } catch (error) {
      if (error instanceof AICoverError) throw error;

      const isAbort =
        error instanceof DOMException &&
        (error.name === "AbortError" ||
          error.name === "TimeoutError");

      if (isAbort) {
        throw new AICoverError(
          "TIMEOUT",
          "Cover generation took too long.",
        );
      }

      throw new AICoverError(
        "NETWORK_ERROR",
        "Could not reach the AI cover service.",
      );
    } finally {
      clearTimeout(timer);
    }
  } finally {
    URL.revokeObjectURL(compressed.url);
  }
}
