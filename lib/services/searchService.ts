import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  APPWRITE_BUCKET_ID,
  storage,
  AppwriteQuery,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";
import type { Product } from "./products";

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

function normalizeSearchResult(doc: Record<string, unknown>): SearchResult {
  const primaryImage = doc.primaryImage as string;
  const resolvedImage =
    primaryImage && !primaryImage.startsWith("http")
      ? storage.getFileView(APPWRITE_BUCKET_ID, primaryImage).toString()
      : (primaryImage ?? "");

  return {
    id: (doc.$id as string) ?? "",
    title: (doc.title as string) ?? "",
    brand: (doc.brand as string) ?? "",
    price: Number(doc.price ?? 0),
    retailPrice: doc.retailPrice != null ? Number(doc.retailPrice) : undefined,
    category: (doc.category as string) ?? "",
    gender: (doc.gender as string) ?? "Unisex",
    size: (doc.size as string) ?? "",
    condition: (doc.condition as string) ?? "",
    primaryImage: resolvedImage,
    slug: (doc.slug as string) ?? "",
  };
}

/**
 * Search products by title, brand, and category using Appwrite full-text search.
 * Falls back to client-side filtering if full-text search is not configured.
 */
export async function searchProducts(
  query: string,
  limit: number = 12,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  if (!isAppwriteDataConfigured) return [];

  try {
    const searchTerm = query.trim().toLowerCase();

    // Try Appwrite full-text search first
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [
        AppwriteQuery.search("title", searchTerm),
        AppwriteQuery.equal("isActive", true),
        AppwriteQuery.equal("status", "active"),
        AppwriteQuery.limit(limit),
      ],
    );

    if (response.documents.length > 0) {
      return response.documents.map((doc) =>
        normalizeSearchResult(doc as Record<string, unknown>),
      );
    }

    // Fallback: fetch recent active products and filter client-side
    const fallbackResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [
        AppwriteQuery.equal("isActive", true),
        AppwriteQuery.equal("status", "active"),
        AppwriteQuery.orderDesc("$createdAt"),
        AppwriteQuery.limit(50),
      ],
    );

    const results = fallbackResponse.documents.filter((doc) => {
      const title = ((doc.title as string) ?? "").toLowerCase();
      const brand = ((doc.brand as string) ?? "").toLowerCase();
      const category = ((doc.category as string) ?? "").toLowerCase();
      const description = ((doc.description as string) ?? "").toLowerCase();
      const color = ((doc.color as string) ?? "").toLowerCase();
      const material = ((doc.material as string) ?? "").toLowerCase();

      return (
        title.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        category.includes(searchTerm) ||
        description.includes(searchTerm) ||
        color.includes(searchTerm) ||
        material.includes(searchTerm)
      );
    });

    return results
      .slice(0, limit)
      .map((doc) => normalizeSearchResult(doc as Record<string, unknown>));
  } catch (error) {
    console.error("searchProducts error:", error);
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
