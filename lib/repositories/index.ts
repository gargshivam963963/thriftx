import * as productRepo from "./productRepository";
import * as catalogRepo from "./catalogRepository";
import * as brandRepo from "./brandRepository";

/**
 * Repository barrel — the single entry point for all data-access layer
 * functions. Pages and services depend on these objects, keeping the
 * "Repository Layer" between the app and Prisma.
 *
 * Repositories:
 *  - productRepository  → Product / ProductImage reads
 *  - catalogRepository  → genders + categories
 *  - brandRepository    → brands
 *
 * Pages never import Prisma directly — they go through this layer.
 */
export const productRepository = {
  getProductsByFilters: productRepo.getProductsByFilters,
  getAllProducts: productRepo.getAllProducts,
  getProductBySlug: productRepo.getProductBySlug,
  getProductById: productRepo.getProductById,
  getProductsByIds: productRepo.getProductsByIds,
  getSimilarProducts: productRepo.getSimilarProducts,
  getProductsForSitemap: productRepo.getProductsForSitemap,
  getBrands: productRepo.getBrands,
  searchProducts: productRepo.searchProducts,
  seedProducts: productRepo.seedProducts,
  importProducts: productRepo.importProducts,
};

export const catalogRepository = {
  getGenders: catalogRepo.getGenders,
  getCategories: catalogRepo.getCategories,
  getBrands: catalogRepo.getBrands,
};

/** BrandRepository — reads/upserts brand data from PostgreSQL. */
export const brandRepository = {
  getBrands: brandRepo.getBrands,
  upsertBrand: brandRepo.upsertBrand,
};

export { productRepository as default };
