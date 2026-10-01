import "server-only";

import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1,
) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }

  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "cart-items",
    [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.equal("productId", productId),
      DocumentQuery.limit(1),
    ],
  );

  if (documents.length > 0) {
    const item = documents[0];
    return documentStore.updateDocument("thriftx", "cart-items", item.$id, {
      quantity: Number(item.quantity ?? 0) + quantity,
    });
  }

  return documentStore.createDocument(
    "thriftx",
    "cart-items",
    DocumentID.unique(),
    { userId, productId, quantity },
  );
}

export async function getCartItems(userId: string) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }

  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "cart-items",
    [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.orderDesc("$createdAt"),
    ],
  );

  return documents.map((doc) => ({
    id: doc.$id,
    userId: String(doc.userId ?? ""),
    productId: String(doc.productId ?? ""),
    quantity: Number(doc.quantity ?? 0),
  })) satisfies CartItem[];
}

export async function removeCartItem(userId: string, id: string) {
  const item = await documentStore.getDocument("thriftx", "cart-items", id);
  if (item.userId !== userId) {
    throw new Error("Cart item not found");
  }
  return documentStore.deleteDocument("thriftx", "cart-items", id);
}

export async function updateCartQuantity(
  userId: string,
  id: string,
  quantity: number,
) {
  const item = await documentStore.getDocument("thriftx", "cart-items", id);
  if (item.userId !== userId) {
    throw new Error("Cart item not found");
  }
  return documentStore.updateDocument("thriftx", "cart-items", id, {
    quantity,
  });
}

export async function clearCart(userId: string) {
  const items = await getCartItems(userId);
  await Promise.all(items.map((item) => removeCartItem(userId, item.id)));
}
