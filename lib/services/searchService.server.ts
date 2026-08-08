import { productRepository } from "@/lib/repositories";
import type { SearchResult } from "./searchService";

/**
 * Server-side implementation of product search.
 *
 * Delegates to the Repository Layer (productRepository → Prisma → PostgreSQL).
 *
 * NOTE: This file is server-only. It imports `@/lib/repositories` →
 * `lib/prisma.ts` → `pg`, so it must only be imported from Route Handlers /
 * Server Components. Client components must use the client-safe
 * `searchProducts()` from `./searchService`, which fetches the
 * `/api/shop/search` route handler.
 */
export async function searchProductsServer(
  query: string,
  limit: number = 12,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const products = await productRepository.searchProducts(query, limit);

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    retailPrice: p.retailPrice,
    category: p.category,
    gender: p.gender,
    size: p.size,
    condition: p.condition,
    primaryImage: p.primaryImage,
    slug: p.slug,
  }));
}
