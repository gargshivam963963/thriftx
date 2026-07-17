import {
  account,
  databases,
  AppwriteID,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_ADDRESSES_COLLECTION_ID,
} from "@/lib/appwrite";

export interface Address {
  id?: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  isDefault: boolean;
}

async function getCurrentUserId() {
  const user = await account.get();
  return user.$id;
}

export async function getAddress(): Promise<Address | null> {
  const userId = await getCurrentUserId();

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_ADDRESSES_COLLECTION_ID,
    [AppwriteQuery.equal("userId", userId), AppwriteQuery.limit(1)],
  );

  if (response.documents.length === 0) {
    return null;
  }

  const doc = response.documents[0];

  return {
    id: doc.$id,
    userId: doc.userId,
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    address: doc.address,
    city: doc.city,
    postalCode: doc.postalCode,
    country: doc.country,
    notes: doc.notes ?? "",
    isDefault: doc.isDefault,
  };
}

export async function saveAddress(data: Omit<Address, "id" | "userId">) {
  const userId = await getCurrentUserId();

  const existing = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_ADDRESSES_COLLECTION_ID,
    [AppwriteQuery.equal("userId", userId), AppwriteQuery.limit(1)],
  );

  if (existing.documents.length > 0) {
    return databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ADDRESSES_COLLECTION_ID,
      existing.documents[0].$id,
      {
        ...data,
      },
    );
  }

  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ADDRESSES_COLLECTION_ID,
    AppwriteID.unique(),
    {
      userId,
      ...data,
    },
  );
}

export async function deleteAddress() {
  const address = await getAddress();

  if (!address?.id) return;

  return databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_ADDRESSES_COLLECTION_ID,
    address.id,
  );
}
