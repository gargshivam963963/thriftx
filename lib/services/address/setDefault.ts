import { AppwriteQuery, databases } from "@/lib/appwrite";
import {
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

import type { Address } from "@/lib/types/address";

interface SetDefaultAddressParams {
  userId: string;
  addressId: string;
}

export async function setDefaultAddress({
  userId,
  addressId,
}: SetDefaultAddressParams): Promise<Address> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      [AppwriteQuery.equal("userId", userId)],
    );

    await Promise.all(
      response.documents.map((document) =>
        databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_ADDRESSES_COLLECTION_ID,
          document.$id,
          {
            isDefault: document.$id === addressId,
          },
        ),
      ),
    );

    const updated = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      addressId,
    );

    return updated as unknown as Address;
  } catch (error) {
    console.error("Failed to set default address:", error);
    throw error;
  }
}
