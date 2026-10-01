import { documentStore, DocumentQuery } from "@/lib/document-store";

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
    const address = await documentStore.getDocument(
      "thriftx",
      "addresses",
      addressId,
    );
    if (address.userId !== userId) {
      throw new Error("Address not found");
    }

    const response = await documentStore.listDocuments("thriftx", "addresses", [
      DocumentQuery.equal("userId", userId),
    ]);

    await Promise.all(
      response.documents.map((document) =>
        documentStore.updateDocument("thriftx", "addresses", document.$id, {
          isDefault: document.$id === addressId,
        }),
      ),
    );

    const updated = await documentStore.getDocument(
      "thriftx",
      "addresses",
      addressId,
    );
    return updated as unknown as Address;
  } catch (error) {
    console.error("Failed to set default address:", error);
    throw error;
  }
}
