import * as productRepo from "./productRepository";
import * as catalogRepo from "./catalogRepository";

/**
 * Repository barrel — the single entry point for all data-access layer
 * functions. Pages and services depend on these objects, keeping the
 * "Repository Layer" between the app and Prisma.
 */
export const productRepository = {
  getProductsByFilters: productRepo.getProductsByFilters,
  getAllProducts: productRepo.getAllProducts,
  getProductBySlug: productRepo.getProductBySlug,
  getProductById: productRepo.getProductById,
  getSimilarProducts: productRepo.getSimilarProducts,
  getProductsForSitemap: productRepo.getProductsForSitemap,
  getBrands: productRepo.getBrands,
  searchProducts: productRepo.searchProducts,
  seedProducts: productRepo.seedProducts,
};

export const catalogRepository = {
  getGenders: catalogRepo.getGenders,
  getCategories: catalogRepo.getCategories,
  getBrands: catalogRepo.getBrands,
};

export { productRepository as default };
