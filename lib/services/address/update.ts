import { documentStore } from "@/lib/document-store";

import type { Address, UpdateAddressPayload } from "@/lib/types/address";

interface UpdateAddressParams {
  userId: string;
  addressId: string;
  data: UpdateAddressPayload;
}

export async function updateAddress({
  userId,
  addressId,
  data,
}: UpdateAddressParams): Promise<Address> {
  try {
    const existing = await documentStore.getDocument(
      "thriftx",
      "addresses",
      addressId,
    );
    if (existing.userId !== userId) {
      throw new Error("Address not found");
    }

    const response = await documentStore.updateDocument(
      "thriftx",
      "addresses",
      addressId,
      data,
    );

    return response as unknown as Address;
  } catch (error) {
    console.error("Failed to update address:", error);
    throw error;
  }
}
