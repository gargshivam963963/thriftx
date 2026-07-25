import { AppwriteID, AppwriteQuery } from "@/lib/appwrite";
import {
  account,
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_WISHLIST_COLLECTION_ID,
} from "@/lib/appwrite";

// Cache current user ID to avoid repeated account.get() calls
let cachedUserId: string | null = null;
let userIdPromise: Promise<string> | null = null;

async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  if (userIdPromise) return userIdPromise;

  userIdPromise = (async () => {
    try {
      const user = await account.get();
      cachedUserId = user.$id;
      return cachedUserId;
    } catch {
      cachedUserId = null;
      throw new Error("Not authenticated");
    } finally {
      userIdPromise = null;
    }
  })();

  return userIdPromise;
}

export async function isWishlisted(productId: string) {
  const userId = await getUserId();

  const result = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WISHLIST_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", userId),
      AppwriteQuery.equal("productId", productId),
      AppwriteQuery.limit(1),
    ],
  );

  return result.documents.length > 0;
}

export async function toggleWishlist(productId: string) {
  const userId = await getUserId();

  const existing = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_WISHLIST_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", userId),
      AppwriteQuery.equal("productId", productId),
      AppwriteQuery.limit(1),
    ],
  );

  if (existing.documents.length) {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_WISHLIST_COLLECTION_ID,
      existing.documents[0].$id,
    );

    return false;
  }

  await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_WISHLIST_COLLECTION_ID,
    AppwriteID.unique(),
    {
      userId,
      productId,
    },
  );

  return true;
}

// Clear cached user ID (call on logout)
export function clearWishlistCache() {
  cachedUserId = null;
}
