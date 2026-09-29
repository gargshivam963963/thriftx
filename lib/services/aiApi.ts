"use client";

/**
 * THRIFTX — AI API client
 * Typed fetch wrapper around `/api/ai/fill` with:
 * - Timeout + AbortController
 * - Response validation
 * - Normalized friendly errors (never raw server internals)
 */

import type {
  AIFillRequest,
  AIFillResponse,
  AIFillErrorCode,
} from "@/lib/ai/types";
import { getFriendlyError } from "@/lib/errors";

/** Default request timeout (ms). */
const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Determine a normalized error code from an HTTP status.
 */
function codeFromStatus(status: number): AIFillErrorCode {
  switch (status) {
    case 400:
    case 422:
      return "VALIDATION";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 429:
      return "RATE_LIMITED";
    case 409:
      return "CONFLICT";
    case 500:
    case 502:
    case 503:
      return "SERVER_ERROR";
    case 504:
      return "TIMEOUT";
    default:
      return "UNKNOWN";
  }
}

/**
 * POST a typed AI fill request.
 * Throws `AIFillApiError` on network/timeout/non-2xx.
 */
export async function postAiFill(
  payload: AIFillRequest,
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<AIFillResponse> {
  return postAiFillBody(
    JSON.stringify(payload),
    { "Content-Type": "application/json" },
    options,
  );
}

export async function postAiFillFiles(
  payload: {
    productId?: string;
    images: Array<{ file: Blob; mimeType: string }>;
    analyzeAllImages: boolean;
  },
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<AIFillResponse> {
  const formData = new FormData();
  if (payload.productId) formData.append("productId", payload.productId);
  formData.append("analyzeAllImages", String(payload.analyzeAllImages));

  payload.images.forEach((image, index) => {
    const extension = image.mimeType.split("/")[1] || "image";
    formData.append("images", image.file, `image-${index + 1}.${extension}`);
  });

  return postAiFillBody(formData, undefined, options);
}

async function postAiFillBody(
  body: BodyInit,
  headers: HeadersInit | undefined,
  options: { timeoutMs?: number; signal?: AbortSignal },
): Promise<AIFillResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Combine external + internal abort signals.
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  try {
    const response = await fetch("/api/ai/fill", {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const code = codeFromStatus(response.status);
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : "AI request failed.";
      throw new AIFillApiError(code, message, response.status);
    }

    return data as AIFillResponse;
  } catch (err) {
    if (err instanceof AIFillApiError) throw err;

    // Abort / network handled here.
    const isAbort =
      err instanceof DOMException &&
      (err.name === "AbortError" || err.name === "TimeoutError");

    if (isAbort) {
      throw new AIFillApiError(
        "TIMEOUT",
        "The request took too long. Please try again.",
        504,
      );
    }

    throw new AIFillApiError("NETWORK_ERROR", getFriendlyError(err), 0, err);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

/** Typed error thrown by `postAiFill`. */
export class AIFillApiError extends Error {
  readonly code: AIFillErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(
    code: AIFillErrorCode,
    message: string,
    status: number,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AIFillApiError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}
