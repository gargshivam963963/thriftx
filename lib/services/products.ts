import { cache } from "react";
import { productRepository } from "@/lib/repositories";

export interface Product {
  id: string;

  // Basic
  title: string;
  brand: string;
  slug: string;

  // Category
  category: string;
  categorySlug: string;

  gender: ProductGender;

  // Pricing
  price: number;
  retailPrice?: number;
  condition: string;

  // Measurements
  size: string;

  /**
   * Required for topwear (T-Shirts, Shirts, Hoodies, Jackets...)
   */
  chest?: string;

  /**
   * Required for bottomwear (Jeans, Cargo, Shorts...)
   */
  waist?: string;

  /**
   * Optional measurements
   */
  length?: string;
  inseam?: string;

  // Details
  color?: string;

  /**
   * Always required
   */
  material: string;

  description?: string;
  shippingInfo?: string;

  // Images
  primaryImage: string;
  images: string[];

  $createdAt?: string;
  $updatedAt?: string;

  // Status
  status: ProductStatus;
  isActive: boolean;
}

export type ProductGender = "Men" | "Women" | "Unisex" | "Kids";

export type ProductStatus = "draft" | "active" | "sold";

export interface ProductFilters {
  category?: string;
  gender?: string;
  brand?: string[];
  size?: string[];
  condition?: string[];
  price?: string;
  color?: string;
  material?: string;
  search?: string;
  /**
   * Raw `?measurement=` value from the shop URL (e.g. `chest-38`,
   * `waist-32`, `length-30`, `chest-44-plus`). Parsed server-side into a
   * tolerant range filter on the string measurement columns so the count
   * and the rows can never disagree.
   */
  measurement?: string;
  /**
   * `popular` is intentionally the same ordering as `newest` (see the
   * repository switch) — the catalogue has no sales-volume signal to rank by,
   * so recency is the honest proxy. `sale` is a real filter: only pieces that
   * carry a retail (MRP) price above our selling price.
   */
  sort?:
    | "newest"
    | "popular"
    | "sale"
    | "price-low"
    | "price-high"
    | "name";
  limit?: number;
  offset?: number;
}

export async function seedProducts(initialProducts: Omit<Product, "id">[]) {
  return productRepository.seedProducts(initialProducts);
}

export async function importProducts(
  initialProducts: (Product & { id: string })[],
) {
  return productRepository.importProducts(initialProducts);
}
// Product reads are memoized PER-REQUEST with React `cache()` — not with
// Next's persistent `unstable_cache` (Data Cache).
//
// Why: the persistent Data Cache served STALE, poisoned entries in production
// — `countProducts` and `getProducts` are two separate cache slots, and one
// returned a cached `0`/`[]` while the other returned fresh data. That produced
// the recurring live symptom "80 pieces" header + "No items found" grid (and the
// mirror-image bug on the API: rows fine but total=0). The bad entries did NOT
// self-heal within the 60s revalidate window. React `cache()` dedupes repeated
// calls WITHIN one render (so count + rows still share a single request's work
// where applicable) but always reads live DB data, so the count and the rows can
// never disagree. With ~80 rows this is cheap. `revalidateTag("products")` in
// the admin write paths is now a harmless no-op but left in place.
export const getProducts = cache(
  async (filters: ProductFilters = {}): Promise<Product[]> => {
    return productRepository.getProductsByFilters(filters);
  },
);

/**
 * Total number of products matching a filter set — the `y` in "showing x of y".
 *
 * Reads live on every request (see {@link getProducts}) so the count always
 * agrees with the rows the grid renders.
 */
export const countProducts = cache(
  async (filters: ProductFilters = {}): Promise<number> => {
    return productRepository.countProductsByFilters(filters);
  },
);

export const getProductById = cache(
  async (id: string): Promise<Product | null> => {
    return productRepository.getProductById(id);
  },
);

export const getProductsByIds = cache(
  async (ids: string[]): Promise<Product[]> => {
    return productRepository.getProductsByIds(ids);
  },
);

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    return productRepository.getProductBySlug(slug);
  },
);

export const getSimilarProducts = cache(
  async (product: Product, limit = 6): Promise<Product[]> => {
    return productRepository.getSimilarProducts(product, limit);
  },
);

export const getBrands = cache(
  async (): Promise<string[]> => {
    return productRepository.getBrands();
  },
);

export const getProductsForSitemap = cache(async () => {
  return productRepository.getProductsForSitemap();
});

const ProductService = {
  getProducts,
  countProducts,
  getProductById,
  getProductBySlug,
  getProductsForSitemap,
  seedProducts,
  importProducts,
  getBrands,
};

export default ProductService;
