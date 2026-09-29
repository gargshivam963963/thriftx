/**
 * THRIFTX AI — Shared Types
 * Strict TypeScript contracts for the AI Fill pipeline.
 * Used by both the client service and the backend route.
 */

/** A single extracted field with confidence scoring. */
export interface AIExtractedField {
  value: string | null;
  confidence: number;
  needsReview: boolean;
}

/** Structured AI product extraction response. */
export interface AIProductResponse {
  brand: AIExtractedField;
  productType: AIExtractedField;
  gender: AIExtractedField;
  category: AIExtractedField;
  color: AIExtractedField;
  material: AIExtractedField;
  condition: AIExtractedField;
  size: AIExtractedField;
  seoTitle: AIExtractedField;
  seoDescription: AIExtractedField;
  chest: AIExtractedField;
  waist: AIExtractedField;
  length: AIExtractedField;
}

/** Request body sent to `/api/ai/fill`. Never contains Base64. */
export interface AIFillRequest {
  /** Optional existing product id (used for caching / attribution). */
  productId?: string;
  /** Public or signed image URLs. Never raw binaries. */
  imageUrls: string[];
  /** When true, analyzes all images. Default: primary/front only. */
  analyzeAllImages?: boolean;
}

/** Successful API response payload. */
export interface AIFillSuccessResponse {
  success: true;
  data: AIProductResponse;
  meta?: {
    durationMs: number;
    imageCount: number;
    requestSizeBytes: number;
    retryCount: number;
    model?: string;
  };
}

/** Error API response payload. Never exposes raw server internals. */
export interface AIFillErrorResponse {
  success: false;
  message: string;
  code: AIFillErrorCode;
  isQuotaError?: boolean;
}

/** Union of the two possible API responses. */
export type AIFillResponse = AIFillSuccessResponse | AIFillErrorResponse;

/** Normalized, user-safe error codes. */
export type AIFillErrorCode =
  | "VALIDATION"
  | "UPLOAD_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "AI_ERROR"
  | "INVALID_RESPONSE"
  | "PAYLOAD_TOO_LARGE"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "UNKNOWN";

/** Client-side validation result for a single image. */
export interface ImageValidationResult {
  valid: boolean;
  reason?: string;
}

/** Configuration for the client-side image compressor. */
export interface CompressionOptions {
  /** Maximum width in pixels. Default 1024. */
  maxWidth: number;
  /** JPEG quality 0-1. Default 0.8. */
  quality: number;
  /** Use WebP when browser supports it. */
  preferWebp: boolean;
}

/** Result of compressing a File. */
export interface CompressedImage {
  file: Blob;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

/** Progress callback for multi-step AI fill pipeline. */
export interface AIFillProgress {
  stage: "validating" | "compressing" | "uploading" | "analyzing";
  /** 0-100 */
  percent: number;
  message: string;
}

/** Result object returned by the `aiFill` service. */
export interface AIFillResult {
  success: boolean;
  data: AIProductResponse | null;
  /** "OK" on success, otherwise a normalized error code. */
  code: AIFillErrorCode | "OK";
  message: string;
  /** True when the request was skipped because it's already cached. */
  cached?: boolean;
}
