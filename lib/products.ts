export type { Product } from "./services/products";

export {
  default as ProductService,
  getProducts,
  getProductById,
  getProductBySlug,
  seedProducts,
  getBrands,
} from "./services/products";
