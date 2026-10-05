import { cache } from "react";
import { unstable_cache } from "next/cache";
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
  sort?: "newest" | "price-low" | "price-high" | "name" | "popular";
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
// Product reads are cached for a short time (60s) and tagged so admin writes
// can revalidate them immediately via `revalidateTag("products")`. Different
// filters/ids produce distinct cache entries (args are part of the cache key).
const PRODUCT_CACHE = { tags: ["products"], revalidate: 60 };

export const getProducts = unstable_cache(
  async (filters: ProductFilters = {}): Promise<Product[]> => {
    return productRepository.getProductsByFilters(filters);
  },
  ["products"],
  PRODUCT_CACHE,
);

export const getProductById = unstable_cache(
  async (id: string): Promise<Product | null> => {
    return productRepository.getProductById(id);
  },
  ["products"],
  PRODUCT_CACHE,
);

export const getProductsByIds = unstable_cache(
  async (ids: string[]): Promise<Product[]> => {
    return productRepository.getProductsByIds(ids);
  },
  ["products"],
  PRODUCT_CACHE,
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    return productRepository.getProductBySlug(slug);
  },
  ["products"],
  PRODUCT_CACHE,
);

export const getSimilarProducts = cache(
  async (product: Product, limit = 6): Promise<Product[]> => {
    return productRepository.getSimilarProducts(product, limit);
  },
);

export const getBrands = unstable_cache(
  async (): Promise<string[]> => {
    return productRepository.getBrands();
  },
  ["brands"],
  { revalidate: 600 },
);

export const getProductsForSitemap = cache(async () => {
  return productRepository.getProductsForSitemap();
});

const ProductService = {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsForSitemap,
  seedProducts,
  importProducts,
  getBrands,
};

export default ProductService;
