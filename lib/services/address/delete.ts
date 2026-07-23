import { databases } from "@/lib/appwrite";
import {
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

export async function deleteAddress(addressId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      addressId,
    );
  } catch (error) {
    console.error("Failed to delete address:", error);
    throw error;
  }
}
