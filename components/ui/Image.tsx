"use client";

import {
  type CSSProperties,
  type ImgHTMLAttributes,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * THRIFTX — Native `<img>` image component.
 *
 * Why this exists
 * ---------------
 * Every product photo is served from Cloudflare R2 through a *presigned* URL
 * whose `X-Amz-Date` / `X-Amz-Signature` query params change on each presign.
 * `next/image` builds its `src` as `/_next/image?url=<that whole URL>&w=…`, so
 * each render produced a brand-new optimizer key — the Vercel Image
 * Optimization cache could never hit. That exhausted the Hobby plan's 5K
 * "Image Optimization - Transformations" quota, after which Vercel answers
 * every optimizer request with `402 (Payment Required)` and all images
 * disappear.
 *
 * R2 already stores each upload as WebP, so the upstream optimizer was adding
 * little value at unbounded cost. This component skips it entirely and renders
 * a native `<img>` pointed straight at the object, while keeping every
 * performance technique the optimizer was (not) providing for us:
 *
 * - **Lazy loading** off-screen, `decoding="async"` so decode never blocks the
 *   main thread.
 * - **`fetchPriority`** — `priority` heroes load at `high`; everything below
 *   the fold drops to `low` so it never competes with real content.
 * - **Intrinsic `width`/`height`** so the browser reserves the box before the
 *   bytes arrive and CLS stays at zero.
 * - **Blur-up placeholder** — `placeholder="blur"` paints `blurDataURL` as a
 *   CSS background behind the pixels, then hands off on load.
 * - **`fill`** replicated with `position: absolute; inset: 0`, matching
 *   `next/image`'s layout exactly so no call site changes.
 *
 * API-compatible with `next/image` on purpose: the props this app actually
 * uses (`src`, `alt`, `width`, `height`, `fill`, `sizes`, `priority`, `quality`,
 * `loading`, `placeholder`, `blurDataURL`, `unoptimized`, `className`,
 * `style`, `onLoad`, `onError`) are all accepted, so swapping
 * `import Image from "next/image"` for this module is a one-line change per
 * file. The optimizer-only knobs (`quality`, `unoptimized`, `sizes` without a
 * `srcSet`) are accepted and intentionally ignored.
 */

export interface ImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "width" | "height" | "loading" | "fetchPriority"
  > {
  src: ImgHTMLAttributes<HTMLImageElement>["src"];
  alt: string;
  width?: number | string;
  height?: number | string;
  /** Stretch to fill the nearest positioned ancestor. Mirrors `next/image`. */
  fill?: boolean;
  /** Eager-load and mark `fetchPriority="high"` (hero / above-the-fold). */
  priority?: boolean;
  /**
   * `"lazy"` defers until near the viewport; `"eager"` fetches immediately.
   * Defaults to `"eager"` for `priority` images, `"lazy"` otherwise.
   */
  loading?: "lazy" | "eager";
  /** Accepted for `next/image` parity. Ignored — no server-side re-encoding. */
  quality?: number | string;
  /** Accepted for `next/image` parity. Ignored — always served as-is. */
  unoptimized?: boolean;
  /** Accepted for `next/image` parity. Ignored without a `srcSet`. */
  sizes?: string;
  /** `"blur"` paints `blurDataURL` until the image decodes. */
  placeholder?: "blur" | "empty";
  /** Data URI shown while loading when `placeholder="blur"`. */
  blurDataURL?: string;
}

export default function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality: _quality,
  unoptimized: _unoptimized,
  sizes: _sizes,
  placeholder = "empty",
  blurDataURL,
  className,
  style,
  loading,
  decoding,
  onLoad,
  onError,
  draggable,
  ...rest
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only eager-load what the caller marked as priority; everything else is
  // lazy, and lazy images get a low fetch priority so they yield the network
  // to content the user is actually looking at.
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFetchPriority = priority ? "high" : "low";

  // Paint the blur placeholder behind the real pixels until they decode, then
  // fade the backdrop out so the handoff is invisible.
  const showBlur = placeholder === "blur" && !!blurDataURL && !loaded && !failed;

  const resolvedStyle: CSSProperties = {
    ...(fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
      : null),
    ...(showBlur
      ? {
          backgroundImage: `url("${blurDataURL}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : null),
    ...style,
  };

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      // Intrinsic dimensions let the browser reserve layout up front. Skipped
      // for `fill`, where the parent box is the source of truth.
      {...(fill ? null : { width, height })}
      className={cn(className)}
      style={resolvedStyle}
      loading={resolvedLoading}
      decoding={decoding ?? "async"}
      // React 19 types `fetchPriority` on <img>; the DOM attribute is
      // lowercase `fetchpriority`.
      fetchPriority={resolvedFetchPriority}
      draggable={draggable ?? false}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
