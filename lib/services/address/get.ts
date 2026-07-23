import { AppwriteQuery, databases } from "@/lib/appwrite";
import {
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

import type { Address } from "@/lib/types/address";

export async function getAddresses(userId: string): Promise<Address[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      [
        AppwriteQuery.equal("userId", userId),
        AppwriteQuery.orderDesc("$createdAt"),
      ],
    );

    return response.documents.map((document) => document as unknown as Address);
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    throw error;
  }
}
