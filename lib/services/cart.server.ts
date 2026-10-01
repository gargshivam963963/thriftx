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

function ensureDatabaseConfigured() {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  _quantity = 1,
) {
  ensureDatabaseConfigured();

  const normalizedProductId = productId.trim();

  if (!userId || !normalizedProductId) {
    throw new Error("Invalid user or product");
  }

  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "cart-items",
    [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.equal("productId", normalizedProductId),
      DocumentQuery.limit(1),
    ],
  );

  if (documents.length > 0) {
    const item = documents[0];

    if (Number(item.quantity) !== 1) {
      return documentStore.updateDocument("thriftx", "cart-items", item.$id, {
        quantity: 1,
      });
    }

    return item;
  }

  return documentStore.createDocument(
    "thriftx",
    "cart-items",
    DocumentID.unique(),
    {
      userId,
      productId: normalizedProductId,
      quantity: 1,
    },
  );
}

export async function getCartItems(userId: string) {
  ensureDatabaseConfigured();

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
    quantity: 1,
  })) satisfies CartItem[];
}

export async function removeCartItem(userId: string, id: string) {
  ensureDatabaseConfigured();

  const item = await documentStore.getDocument("thriftx", "cart-items", id);

  if (String(item.userId) !== userId) {
    throw new Error("Cart item not found");
  }

  return documentStore.deleteDocument("thriftx", "cart-items", id);
}

export async function updateCartQuantity(
  userId: string,
  id: string,
  _quantity: number,
) {
  ensureDatabaseConfigured();

  const item = await documentStore.getDocument("thriftx", "cart-items", id);

  if (String(item.userId) !== userId) {
    throw new Error("Cart item not found");
  }

  if (Number(item.quantity) === 1) {
    return item;
  }

  return documentStore.updateDocument("thriftx", "cart-items", id, {
    quantity: 1,
  });
}

export async function clearCart(userId: string) {
  ensureDatabaseConfigured();

  const items = await getCartItems(userId);

  await Promise.all(items.map((item) => removeCartItem(userId, item.id)));
}
