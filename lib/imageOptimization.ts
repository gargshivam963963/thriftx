"use client";

/**
 * THRIFTX — Image Optimization Utilities
 * Shared helpers for blur placeholders and optimized image loading.
 */

/** Tiny SVG blur placeholder data URI (used as `blurDataURL`). */
export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IiNkMWQ1ZGIiLz48L3N2Zz4=";

/**
 * Generate a deterministic low-res blur placeholder for a local blob URL.
 * For local previews we return the shared placeholder since we can't
 * pre-generate a data URI without decoding the image.
 */
export function getBlurPlaceholder(): string {
  return BLUR_PLACEHOLDER;
}

/**
 * Next.js `sizes` helper for common thumbnail grids.
 */
export function getResponsiveSizes(
  breakpoint: "thumb" | "card" | "full",
): string {
  switch (breakpoint) {
    case "thumb":
      return "44px";
    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    case "full":
      return "90vw";
    default:
      return "100vw";
  }
}
