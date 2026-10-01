import { documentStore, DocumentQuery } from "@/lib/document-store";

import type { Address } from "@/lib/types/address";

export async function getAddresses(userId: string): Promise<Address[]> {
  try {
    const response = await documentStore.listDocuments("thriftx", "addresses", [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.orderDesc("$createdAt"),
    ]);

    return response.documents.map((document) => document as unknown as Address);
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    throw error;
  }
}
