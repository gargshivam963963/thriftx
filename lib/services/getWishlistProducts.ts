import {
  databases,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_WISHLIST_COLLECTION_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  APPWRITE_BUCKET_ID,
  storage,
} from "@/lib/appwrite";
import { account } from "@/lib/appwrite";

export interface WishlistProduct {
  wishlistId: string;
  productId: string;
  title: string;
  brand: string;
  price: number;
  primaryImage: string;
  size: string;
  condition: string;
  category: string;
  slug: string;
  addedAt: string;
}

/**
 * Fetch all wishlisted products with full product details for the current user.
 */
export async function getWishlistProducts(): Promise<WishlistProduct[]> {
  const user = await account.get();
  const userId = user.$id;

  // 1. Fetch all wishlist entries for this user
  const wishlistResponse = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WISHLIST_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", userId),
      AppwriteQuery.orderDesc("$createdAt"),
      AppwriteQuery.limit(100),
    ],
  );

  if (wishlistResponse.documents.length === 0) {
    return [];
  }

  // 2. Extract product IDs
  const productIds = wishlistResponse.documents.map(
    (doc) => doc.productId as string,
  );

  // 3. Fetch products in parallel (Appwrite supports "equal" with array for "in" queries)
  const productsResponse = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_PRODUCTS_COLLECTION_ID,
    [
      AppwriteQuery.equal("$id", productIds),
      AppwriteQuery.equal("isActive", true),
    ],
  );

  // 4. Build a map of productId -> product data
  const productMap = new Map<string, Record<string, unknown>>();
  for (const doc of productsResponse.documents) {
    productMap.set(doc.$id, doc);
  }

  // 5. Merge wishlist + product data, preserving wishlist order
  const result: WishlistProduct[] = [];

  for (const wishDoc of wishlistResponse.documents) {
    const pid = wishDoc.productId as string;
    const product = productMap.get(pid);

    if (!product) continue; // Product might have been deleted

    const primaryImage = (product.primaryImage as string) || "";
    const resolvedImage = primaryImage.startsWith("http")
      ? primaryImage
      : storage.getFileView(APPWRITE_BUCKET_ID, primaryImage).toString();

    result.push({
      wishlistId: wishDoc.$id,
      productId: pid,
      title: (product.title as string) || "",
      brand: (product.brand as string) || "",
      price: Number(product.price ?? 0),
      primaryImage: resolvedImage,
      size: (product.size as string) || "",
      condition: (product.condition as string) || "",
      category: (product.category as string) || "",
      slug: (product.slug as string) || "",
      addedAt: wishDoc.$createdAt as string,
    });
  }

  return result;
}
