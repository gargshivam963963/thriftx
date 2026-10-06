/**
 * Storefront product pagination.
 *
 * This lives in its own dependency-free module on purpose: the shop page is a
 * Server Component and the shop grid is a Client Component, and they must agree
 * on the page size. Importing the constant from a `"use client"` file would hand
 * the server component a client-reference proxy (`undefined`) instead of the
 * number, which silently turns `limit`/`offset` into `undefined`/`NaN`.
 */

/** Default rows per page on the storefront grid. */
export const DEFAULT_PAGE_SIZE = 50;

/** Page-size choices offered to the shopper. */
export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

/**
 * Backwards-compatible alias — prefer `DEFAULT_PAGE_SIZE`.
 * @deprecated Use DEFAULT_PAGE_SIZE instead.
 */
export const ITEMS_PER_PAGE = DEFAULT_PAGE_SIZE;