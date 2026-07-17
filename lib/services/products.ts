import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  AppwriteQuery,
  AppwriteID,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";

export interface Product {
  id: string;
  brand: string;
  title: string;
  price: string;
  condition: string;
  image: string;
  category: string;
  subCategory: string;
  onlyOneLeft?: boolean;
  description?: string;
  retailPrice?: string;
  measurements?: {
    size?: string;
    chest?: string;
    length?: string;
    shoulders?: string;
  };
  shippingInfo?: string;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  brand?: string[];
  size?: string[];
  price?: string; // <-- Add this
  sort?: "newest" | "price-low" | "price-high" | "name";
  limit?: number;
}

function normalizeProduct(data: any, id?: string): Product {
  const measurements = data.measurements ?? {
    size: data.size ?? "",
    chest: data.chest ?? "",
    length: data.length ?? "",
    shoulders: data.shoulders ?? "",
  };

  return {
    id: id ?? data.id ?? "",
    brand: data.brand ?? "",
    title: data.productName ?? data.title ?? "",
    price: String(data.price ?? ""),
    condition: data.condition ?? "",
    image:
      Array.isArray(data.imageIds) && data.imageIds.length
        ? data.imageIds[0]
        : (data.image ?? ""),
    category: data.categorySlug ?? data.category ?? "",
    subCategory: data.subCategorySlug ?? data.subCategory ?? "",
    onlyOneLeft:
      typeof data.stockQuantity === "number" ? data.stockQuantity <= 1 : false,
    description:
      data.description ?? data.productDescription ?? data.summary ?? "",
    retailPrice: String(data.retailPrice ?? data.retail_price ?? ""),
    measurements: {
      size: measurements.size ?? "",
      chest: measurements.chest ?? "",
      length: measurements.length ?? "",
      shoulders: measurements.shoulders ?? "",
    },
    shippingInfo: data.shippingInfo ?? data.shippingDetails ?? "",
  };
}

export async function seedProducts(initialProducts: Omit<Product, "id">[]) {
  if (!isAppwriteDataConfigured) {
    return {
      seeded: false,
      fallback: true,
    };
  }

  try {
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [AppwriteQuery.limit(1)],
    );

    if (existing.documents.length > 0) {
      return {
        seeded: false,
      };
    }

    for (const product of initialProducts) {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PRODUCTS_COLLECTION_ID,
        AppwriteID.unique(),
        {
          productName: product.title,
          brand: product.brand,
          description: product.description ?? "",
          price: Number(product.price),
          retailPrice: Number(product.retailPrice ?? 0),
          condition: product.condition,
          categorySlug: product.category,
          subCategorySlug: product.subCategory,
          stockQuantity: product.onlyOneLeft ? 1 : 5,
          imageIds: product.image ? [product.image] : [],
          size: product.measurements?.size ?? "",
          chest: product.measurements?.chest ?? "",
          length: product.measurements?.length ?? "",
          shoulders: product.measurements?.shoulders ?? "",
          shippingInfo: product.shippingInfo ?? "",
        },
      );
    }

    return {
      seeded: true,
    };
  } catch (error) {
    console.error("seedProducts:", error);
    throw error;
  }
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  if (!isAppwriteDataConfigured) {
    console.error("Appwrite configuration missing.");
    return [];
  }

  const queries: any[] = [];

  if (filters.category) {
    queries.push(AppwriteQuery.equal("categorySlug", filters.category));
  }

  if (filters.subCategory) {
    queries.push(AppwriteQuery.equal("subCategorySlug", filters.subCategory));
  }

  if (filters.brand?.length) {
    queries.push(AppwriteQuery.equal("brand", filters.brand));
  }

  if (filters.condition?.length) {
    queries.push(AppwriteQuery.equal("condition", filters.condition));
  }

  if (filters.size?.length) {
    queries.push(AppwriteQuery.equal("size", filters.size));
  }

  if (filters.price) {
    switch (filters.price) {
      case "0-499":
        queries.push(AppwriteQuery.lessThanEqual("price", 499));
        break;

      case "500-999":
        queries.push(AppwriteQuery.greaterThanEqual("price", 500));
        queries.push(AppwriteQuery.lessThanEqual("price", 999));
        break;

      case "1000-1499":
        queries.push(AppwriteQuery.greaterThanEqual("price", 1000));
        queries.push(AppwriteQuery.lessThanEqual("price", 1499));
        break;

      case "1500+":
        queries.push(AppwriteQuery.greaterThanEqual("price", 1500));
        break;
    }
  }

  switch (filters.sort) {
    case "newest":
      queries.push(AppwriteQuery.orderDesc("$createdAt"));
      break;

    case "price-low":
      queries.push(AppwriteQuery.orderAsc("price"));
      break;

    case "price-high":
      queries.push(AppwriteQuery.orderDesc("price"));
      break;

    default:
      queries.push(AppwriteQuery.orderAsc("productName"));
  }

  queries.push(AppwriteQuery.limit(filters.limit ?? 48));

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    queries,
  );

  let products = response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;

    return normalizeProduct(
      {
        ...data,
        id: $id,
      },
      $id,
    );
  });

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isAppwriteDataConfigured) {
    return null;
  }

  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      id,
    );

    const { $id, $collection, $database, ...data } = doc as any;

    return normalizeProduct(
      {
        ...data,
        id: $id,
      },
      $id,
    );
  } catch {
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isAppwriteDataConfigured) {
    return null;
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    [AppwriteQuery.equal("slug", slug), AppwriteQuery.limit(1)],
  );

  if (!response.documents.length) {
    return null;
  }

  const doc = response.documents[0];

  const { $id, $collection, $database, ...data } = doc;

  return normalizeProduct(
    {
      ...data,
      id: $id,
    },
    $id,
  );
}

const ProductService = {
  getProducts,
  getProductById,
  getProductBySlug,
  seedProducts,
  getBrands,
};

export async function getBrands(): Promise<string[]> {
  const products = await getProducts({ limit: 500 });

  return [...new Set(products.map((p) => p.brand))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export default ProductService;
