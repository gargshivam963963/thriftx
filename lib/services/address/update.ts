import { databases } from "@/lib/appwrite";
import {
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

import type { Address, UpdateAddressPayload } from "@/lib/types/address";

interface UpdateAddressParams {
  addressId: string;
  data: UpdateAddressPayload;
}

export async function updateAddress({
  addressId,
  data,
}: UpdateAddressParams): Promise<Address> {
  try {
    const response = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      addressId,
      data,
    );

    return response as unknown as Address;
  } catch (error) {
    console.error("Failed to update address:", error);
    throw error;
  }
}
