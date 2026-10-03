import "server-only";

import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import { getProductById } from "@/lib/services/products";

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
}

const DATABASE_ID = "thriftx";
const COLLECTION = "cart-items";

function ensureDatabaseConfigured(): void {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }
}

function validateIdentity(userId: string, productId?: string): void {
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("Invalid user");
  }

  if (
    productId !== undefined &&
    (typeof productId !== "string" || !productId.trim())
  ) {
    throw new Error("Invalid product");
  }
}

function toCartItem(document: {
  $id: string;
  userId?: unknown;
  productId?: unknown;
}): CartItem {
  return {
    id: document.$id,
    userId: String(document.userId ?? ""),
    productId: String(document.productId ?? ""),
    quantity: 1,
  };
}

async function findUserProduct(userId: string, productId: string) {
  const { documents } = await documentStore.listDocuments(
    DATABASE_ID,
    COLLECTION,
    [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.equal("productId", productId),
      DocumentQuery.limit(1),
    ],
  );

  return documents[0] ?? null;
}

export async function addToCart(
  userId: string,
  productId: string,
  _quantity = 1,
) {
  ensureDatabaseConfigured();
  validateIdentity(userId, productId);

  const normalizedUserId = userId.trim();
  const normalizedProductId = productId.trim();

  const product = await getProductById(normalizedProductId);
  if (!product) {
    throw new Error("Product is no longer available");
  }

  const existing = await findUserProduct(normalizedUserId, normalizedProductId);

  if (existing) {
    if (Number(existing.quantity) !== 1) {
      return documentStore.updateDocument(
        DATABASE_ID,
        COLLECTION,
        existing.$id,
        { quantity: 1 },
      );
    }

    return existing;
  }

  return documentStore.createDocument(
    DATABASE_ID,
    COLLECTION,
    DocumentID.unique(),
    {
      userId: normalizedUserId,
      productId: normalizedProductId,
      quantity: 1,
    },
  );
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  ensureDatabaseConfigured();
  validateIdentity(userId);

  const { documents } = await documentStore.listDocuments(
    DATABASE_ID,
    COLLECTION,
    [
      DocumentQuery.equal("userId", userId.trim()),
      DocumentQuery.orderDesc("$createdAt"),
    ],
  );

  const seenProducts = new Set<string>();
  const items: CartItem[] = [];

  for (const document of documents) {
    const item = toCartItem(document);

    if (!item.productId || seenProducts.has(item.productId)) {
      continue;
    }

    seenProducts.add(item.productId);
    items.push(item);
  }

  return items;
}

export async function removeCartItem(
  userId: string,
  id: string,
): Promise<void> {
  ensureDatabaseConfigured();
  validateIdentity(userId);

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid cart item");
  }

  const item = await documentStore.getDocument(
    DATABASE_ID,
    COLLECTION,
    id.trim(),
  );

  if (String(item.userId ?? "") !== userId.trim()) {
    throw new Error("Cart item not found");
  }

  await documentStore.deleteDocument(DATABASE_ID, COLLECTION, id.trim());
}

export async function updateCartQuantity(
  userId: string,
  id: string,
  _quantity: number,
) {
  ensureDatabaseConfigured();
  validateIdentity(userId);

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid cart item");
  }

  const item = await documentStore.getDocument(
    DATABASE_ID,
    COLLECTION,
    id.trim(),
  );

  if (String(item.userId ?? "") !== userId.trim()) {
    throw new Error("Cart item not found");
  }

  if (Number(item.quantity) === 1) {
    return item;
  }

  return documentStore.updateDocument(DATABASE_ID, COLLECTION, id.trim(), {
    quantity: 1,
  });
}

export async function clearCart(userId: string): Promise<void> {
  ensureDatabaseConfigured();
  validateIdentity(userId);

  const items = await getCartItems(userId);

  await Promise.all(items.map((item) => removeCartItem(userId, item.id)));
}
