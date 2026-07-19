import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  APPWRITE_BUCKET_ID,
  storage,
  AppwriteQuery,
  AppwriteID,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";

export interface Product {
  id: string;

  // Basic
  title: string;
  brand: string;
  slug: string;

  // Category
  category: string;
  categorySlug: string;

  gender: "Men" | "Women" | "Unisex" | "Kids";

  // Pricing
  price: number;
  retailPrice?: number;
  condition: string;

  // Measurements
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
  inseam?: string;

  // Details
  color?: string;
  material?: string;
  description?: string;
  shippingInfo?: string;

  // Images
  primaryImage: string;
  images: string[];

  // Status
  status: "draft" | "active" | "sold";
  isActive: boolean;
}

export interface ProductFilters {
  category?: string;
  gender?: string;
  brand?: string[];
  size?: string[];
  condition?: string[];
  price?: string;
  sort?: "newest" | "price-low" | "price-high" | "name";
  limit?: number;
}

function normalizeProduct(data: any, id?: string): Product {
  const primaryImage =
    data.primaryImage && !data.primaryImage.startsWith("http")
      ? storage.getFileView(APPWRITE_BUCKET_ID, data.primaryImage).toString()
      : (data.primaryImage ?? "");

  const images =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images.map((img: string) =>
          img.startsWith("http")
            ? img
            : storage.getFileView(APPWRITE_BUCKET_ID, img).toString(),
        )
      : primaryImage
        ? [primaryImage]
        : [];
  Array.isArray(data.images) && data.images.length > 0
    ? data.images
    : primaryImage
      ? [primaryImage]
      : [];

  return {
    id: id ?? data.id ?? "",

    title: data.title ?? "",
    brand: data.brand ?? "",
    slug: data.slug ?? "",

    category: data.category ?? "",
    categorySlug: data.categorySlug ?? "",

    gender: data.gender ?? "Unisex",

    price: Number(data.price ?? 0),
    retailPrice:
      data.retailPrice !== undefined &&
      data.retailPrice !== null &&
      data.retailPrice !== ""
        ? Number(data.retailPrice)
        : undefined,

    condition: data.condition ?? "",

    size: data.size ?? "",
    chest: data.chest ?? "",
    waist: data.waist ?? "",
    length: data.length ?? "",
    inseam: data.inseam ?? "",

    color: data.color ?? "",
    material: data.material ?? "",

    description: data.description ?? "",
    shippingInfo: data.shippingInfo ?? "",

    primaryImage,
    images,

    status: data.status ?? "active",
    isActive: data.isActive ?? true,
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
          title: product.title,
          brand: product.brand,

          slug: product.slug,

          category: product.category,
          categorySlug: product.categorySlug,
          gender: product.gender,

          price: Number(product.price),
          retailPrice:
            product.retailPrice !== undefined
              ? Number(product.retailPrice)
              : undefined,

          condition: product.condition,

          size: product.size,
          chest: product.chest ?? "",
          waist: product.waist ?? "",
          length: product.length ?? "",
          inseam: product.inseam ?? "",

          color: product.color ?? "",
          material: product.material ?? "",

          description: product.description ?? "",
          shippingInfo: product.shippingInfo ?? "",

          primaryImage: product.primaryImage,
          images: product.images,

          status: product.status,
          isActive: product.isActive,
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
  queries.push(AppwriteQuery.equal("isActive", true));
  queries.push(AppwriteQuery.equal("status", "active"));

  if (filters.gender) {
    const gender =
      filters.gender.charAt(0).toUpperCase() +
      filters.gender.slice(1).toLowerCase();

    queries.push(AppwriteQuery.equal("gender", gender));
  }

  if (filters.category) {
    queries.push(AppwriteQuery.equal("categorySlug", filters.category));
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
      queries.push(AppwriteQuery.orderAsc("title"));
  }

  queries.push(AppwriteQuery.limit(filters.limit ?? 48));

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    queries,
  );

  return response.documents.map((doc: any) => {
    const { $id, ...data } = doc;

    return normalizeProduct(data, $id);
  });
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

    const { $id, ...data } = doc as any;

    return normalizeProduct(data, $id);
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

  const { $id, ...data } = doc;

  return normalizeProduct(data, $id);
}

export async function getBrands(): Promise<string[]> {
  const products = await getProducts({
    limit: 500,
  });

  return [...new Set(products.map((p) => p.brand))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

const ProductService = {
  getProducts,
  getProductById,
  getProductBySlug,
  seedProducts,
  getBrands,
};

export default ProductService;
