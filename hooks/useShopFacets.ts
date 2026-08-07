"use client";

import { useMemo } from "react";
import type { Product } from "@/lib/services/products";

/**
 * Standard clothing size ordering (small → large, plus special sizes).
 * Only sizes that actually exist in the loaded products are shown —
 * so if no product has XXL, XXL is hidden automatically.
 */
export const SIZE_ORDER = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "3XL",
  "4XL",
  "Oversized",
  "One Size",
];

export interface ShopFacets {
  sizes: string[];
  colors: string[];
  materials: string[];
  conditions: string[];
  brands: string[];
}

function uniqueSorted(
  values: (string | undefined)[],
  order?: string[],
): string[] {
  const cleaned = [
    ...new Set(
      values.map((v) => v?.trim()).filter((v): v is string => Boolean(v)),
    ),
  ];

  if (order) {
    return cleaned.sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      // Known sizes come first in defined order; unknown stay at the end.
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  return cleaned.sort((a, b) => a.localeCompare(b));
}

/**
 * Derives dynamic filter options (sizes, colors, materials, conditions, brands)
 * from the currently loaded products. Everything is memoized so it never
 * recomputes on unrelated re-renders.
 */
export function useShopFacets(products: Product[]): ShopFacets {
  return useMemo(() => {
    return {
      sizes: uniqueSorted(
        products.map((p) => p.size),
        SIZE_ORDER,
      ),
      colors: uniqueSorted(products.map((p) => p.color)),
      materials: uniqueSorted(products.map((p) => p.material)),
      conditions: uniqueSorted(products.map((p) => p.condition)),
      brands: uniqueSorted(products.map((p) => p.brand)),
    };
  }, [products]);
}
