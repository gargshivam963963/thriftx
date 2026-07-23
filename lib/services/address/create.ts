import { AppwriteID, databases } from "@/lib/appwrite";
import {
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

import type { Address, CreateAddressPayload } from "@/lib/types/address";

interface CreateAddressParams {
  userId: string;
  data: CreateAddressPayload;
}

export async function createAddress({
  userId,
  data,
}: CreateAddressParams): Promise<Address> {
  try {
    const response = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      AppwriteID.unique(),
      {
        userId,

        fullName: data.fullName,
        phone: data.phone,
        alternatePhone: data.alternatePhone ?? "",

        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? "",
        landmark: data.landmark ?? "",

        city: data.city,
        state: data.state,
        pincode: data.pincode,

        type: data.type,

        isDefault: data.isDefault ?? false,
      },
    );

    return response as unknown as Address;
  } catch (error) {
    console.error("Failed to create address:", error);
    throw error;
  }
}
