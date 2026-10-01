import "server-only";

import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";

export async function getWishlistedProductIds(userId: string) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }

  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "wishlists",
    [DocumentQuery.equal("userId", userId)],
  );

  return documents
    .map((document) => document.productId)
    .filter((productId): productId is string => typeof productId === "string");
}

export async function toggleWishlist(userId: string, productId: string) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Neon database is not configured");
  }

  const { documents } = await documentStore.listDocuments("thriftx", "wishlists", [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.equal("productId", productId),
    DocumentQuery.limit(1),
  ]);

  if (documents.length) {
    await documentStore.deleteDocument(
      "thriftx",
      "wishlists",
      documents[0].$id,
    );
    return false;
  }

  await documentStore.createDocument(
    "thriftx",
    "wishlists",
    DocumentID.unique(),
    { userId, productId },
  );

  return true;
}
