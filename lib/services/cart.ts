import {
  databases,
  account,
  AppwriteID,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_CART_ITEMS_COLLECTION_ID,
} from "@/lib/appwrite";

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

async function getCurrentUserId() {
  const user = await account.get();
  return user.$id;
}

export async function addToCart(productId: string, quantity = 1) {
  const userId = await getCurrentUserId();

  const existing = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_CART_ITEMS_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", userId),
      AppwriteQuery.equal("productId", productId),
      AppwriteQuery.limit(1),
    ],
  );

  if (existing.documents.length > 0) {
    const item = existing.documents[0];

    return databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CART_ITEMS_COLLECTION_ID,
      item.$id,
      {
        quantity: item.quantity + quantity,
      },
    );
  }

  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_CART_ITEMS_COLLECTION_ID,
    AppwriteID.unique(),
    {
      userId,
      productId,
      quantity,
    },
  );
}

export async function getCartItems() {
  const userId = await getCurrentUserId();

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_CART_ITEMS_COLLECTION_ID,
    [
      AppwriteQuery.equal("userId", userId),
      AppwriteQuery.orderDesc("$createdAt"),
    ],
  );

  return response.documents.map((doc) => ({
    id: doc.$id,
    userId: doc.userId,
    productId: doc.productId,
    quantity: doc.quantity,
  })) as CartItem[];
}

export async function removeCartItem(id: string) {
  return databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_CART_ITEMS_COLLECTION_ID,
    id,
  );
}

export async function updateCartQuantity(id: string, quantity: number) {
  return databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_CART_ITEMS_COLLECTION_ID,
    id,
    {
      quantity,
    },
  );
}

export async function clearCart() {
  const items = await getCartItems();

  await Promise.all(items.map((item) => removeCartItem(item.id)));
}
