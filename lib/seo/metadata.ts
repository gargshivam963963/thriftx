/**
 * THRIFTX — Shared structured-data & metadata helpers.
 *
 * All JSON-LD is serialized with `<`/`>`/`&` escaped so that product data can
 * never break the `<script type="application/ld+json">` block or inject tags.
 * Reuse these instead of hand-writing duplicate JSON-LD blocks.
 */

import type { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

/**
 * https://schema.org/ ItemCondition values we support.
 */
export type ItemCondition =
  | "https://schema.org/NewCondition"
  | "https://schema.org/UsedCondition"
  | "https://schema.org/GoodCondition"
  | "https://schema.org/FairCondition";

/** Map the store's free-text `condition` values onto schema.org ItemCondition. */
export function itemConditionFromStoreValue(value: string): ItemCondition {
  const normalized = value.toLowerCase();
  if (
    normalized.includes("new") ||
    normalized.includes("unused") ||
    normalized.includes("never worn")
  ) {
    return "https://schema.org/NewCondition";
  }
  if (
    normalized.includes("good") ||
    normalized.includes("like new") ||
    normalized.includes("excellent")
  ) {
    return "https://schema.org/GoodCondition";
  }
  if (normalized.includes("fair") || normalized.includes("worn")) {
    return "https://schema.org/FairCondition";
  }
  // Default to UsedCondition for vintage, pre-loved, used, or unknown.
  return "https://schema.org/UsedCondition";
}

/** Escape JSON-LD so the serialized block can never close the script tag. */
export function escapeJsonLd(value: string): string {
  return value
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Canonical URL for any path on the production domain. */
export function canonicalUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

/** Availability for structured data: only truthy when the listing is live. */
export function productAvailability(
  product: { status: string; isActive: boolean },
): "https://schema.org/InStock" | "https://schema.org/OutOfStock" {
  if (!product.isActive || product.status !== "active") {
    return "https://schema.org/OutOfStock";
  }
  return "https://schema.org/InStock";
}

export interface JsonLdProduct {
  "@context": string;
  "@type": string;
  name: string;
  description?: string;
  image?: string[];
  url: string;
  offers?: {
    "@type": "https://schema.org/Offer";
    priceCurrency: "INR";
    price: number;
    availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    itemCondition?: ItemCondition;
    url?: string;
  };
}

/** Build a safe JSON-LD string for the Product/Offer block (no wrapper tag). */
export function serializeProductJsonLd(product: {
  title: string;
  description?: string;
  primaryImage: string;
  price: number;
  condition: string;
  status: string;
  isActive: boolean;
  slug: string;
}, canonical: string): string {
  const conditions = itemConditionFromStoreValue(product.condition);
  const availability = productAvailability({ status: product.status, isActive: product.isActive });
  const base: JsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "https://schema.org/Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.primaryImage ? [product.primaryImage] : [],
    url: canonical,
    offers: {
      "@type": "https://schema.org/Offer",
      priceCurrency: "INR",
      price: product.price,
      availability,
      itemCondition: conditions,
      url: canonical,
    },
  };

  return escapeJsonLd(JSON.stringify(base));
}

/** Build a safe JSON-LD string for a BreadcrumbList (no wrapper tag). */
export function serializeBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): string {
  const safe = escapeJsonLd(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "https://schema.org/BreadcrumbList",
      "@version": 1,
      itemListElement: items.map((item, index) => ({
        "@type": "https://schema.org/ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }),
  );
  return safe;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Home > Shop > {gender} > {category} breadcrumbs for product and category
 * pages. `genderName` is the display label (e.g. "Men"); the URL segment is
 * lower-cased so it matches the storefront route (`/shop/men/...`). An optional
 * category appends the final navigational crumb when present.
 */
export function buildCategoryBreadcrumbs(
  genderName: string,
  category?: { name: string; slug: string },
): BreadcrumbItem[] {
  const genderSlug = genderName.toLowerCase();
  const items: BreadcrumbItem[] = [
    { name: "Home", url: siteConfig.url },
    { name: "Shop", url: `${siteConfig.url}/shop` },
    { name: genderName, url: `${siteConfig.url}/shop/${genderSlug}` },
  ];
  if (category) {
    items.push({
      name: category.name,
      url: `${siteConfig.url}/shop/${genderSlug}/${category.slug}`,
    });
  }
  return items;
}
