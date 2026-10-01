import { documentStore } from "@/lib/document-store";

export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  try {
    const existing = await documentStore.getDocument(
      "thriftx",
      "addresses",
      addressId,
    );
    if (existing.userId !== userId) {
      throw new Error("Address not found");
    }

    await documentStore.deleteDocument("thriftx", "addresses", addressId);
  } catch (error) {
    console.error("Failed to delete address:", error);
    throw error;
  }
}
