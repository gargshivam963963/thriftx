export interface SearchResult {
  id: string;
  title: string;
  brand: string;
  price: number;
  retailPrice?: number;
  category: string;
  gender: string;
  size: string;
  condition: string;
  primaryImage: string;
  slug: string;
}

/**
 * Client-safe wrapper around the search route handler.
 *
 * Used by "use client" components (e.g. GlobalSearch). It does NOT import
 * Prisma / pg, so it is safe to bundle for the browser. Product search runs
 * server-side through Route Handler → Repository Layer → Prisma → PostgreSQL.
 *
 * Returns an empty array on any failure so the UI can render a graceful
 * empty state instead of crashing.
 */
export async function searchProducts(
  query: string,
  limit: number = 12,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const res = await fetch(`/api/shop/search?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[searchProducts] route handler returned", res.status);
      return [];
    }

    const data = (await res.json()) as {
      success: boolean;
      products?: SearchResult[];
    };

    if (!data.success || !Array.isArray(data.products)) {
      return [];
    }

    return data.products;
  } catch (error) {
    console.error("[searchProducts] failed to fetch search results:", error);
    return [];
  }
}

/**
 * Get trending search suggestions based on popular categories & brands
 */
export function getTrendingSearches(): string[] {
  return [
    "T-Shirts",
    "Hoodies",
    "Jeans",
    "Jackets",
    "Vintage",
    "Nike",
    "Levi's",
    "Shirts",
    "Cargo",
    "Under ₹500",
  ];
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("thriftx_recent_searches");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to localStorage (most recent first, max 8)
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== query.trim().toLowerCase(),
    );
    filtered.unshift(query.trim());
    localStorage.setItem(
      "thriftx_recent_searches",
      JSON.stringify(filtered.slice(0, 8)),
    );
  } catch {
    // ignore
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("thriftx_recent_searches");
}
