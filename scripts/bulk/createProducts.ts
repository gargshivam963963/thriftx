import { ID } from "node-appwrite";

import { databases, APPWRITE } from "./appwrite";
import { CsvProduct } from "./types";
import { createCategorySlug, createProductSlug } from "./slug";
import { UploadedImages } from "./uploadImages";

export async function createProduct(
  product: CsvProduct,
  uploadedImages: UploadedImages,
) {
  return databases.createDocument(
    APPWRITE.DATABASE_ID,
    APPWRITE.PRODUCTS_COLLECTION_ID,
    ID.unique(),
    {
      title: product.title,

      brand: product.brand,

      slug: createProductSlug(product.title),

      gender: product.gender,

      category: product.category,

      categorySlug: createCategorySlug(product.category),

      price: Number(product.price),

      retailPrice:
        product.retailPrice.trim() !== ""
          ? Number(product.retailPrice)
          : undefined,

      condition: product.condition,

      size: product.size,

      color: product.color,

      material: product.material,

      description: product.description,

      shippingInfo: product.shippingInfo,

      primaryImage: uploadedImages.primaryImage,

      images: uploadedImages.images,

      status: "active",

      isActive: true,
    },
  );
}
