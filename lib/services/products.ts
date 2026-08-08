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
  sort?: "newest" | "price-low" | "price-high" | "name" | "popular";
  limit?: number;
  offset?: number;
}

export async function seedProducts(initialProducts: Omit<Product, "id">[]) {
  return productRepository.seedProducts(initialProducts);
}
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  return productRepository.getProductsByFilters(filters);
}

export async function getProductById(id: string): Promise<Product | null> {
  return productRepository.getProductById(id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productRepository.getProductBySlug(slug);
}

export async function getSimilarProducts(
  product: Product,
  limit = 6,
): Promise<Product[]> {
  return productRepository.getSimilarProducts(product, limit);
}

export async function getBrands(): Promise<string[]> {
  return productRepository.getBrands();
}

export async function getProductsForSitemap() {
  return productRepository.getProductsForSitemap();
}

const ProductService = {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsForSitemap,
  seedProducts,
  getBrands,
};

export default ProductService;
