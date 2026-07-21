import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_CATEGORIES_COLLECTION_ID,
  AppwriteQuery,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";

export interface Category {
  id: string;
  name?: string;
  image?: string;
  order?: number;
  active?: boolean;
  slug?: string;
}

export async function getCategories(): Promise<Category[]> {
  if (!isAppwriteDataConfigured) {
    console.error(
      "Appwrite dynamic category data unavailable. Set NEXT_PUBLIC_APPWRITE_* env vars.",
    );
    return [];
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_CATEGORIES_COLLECTION_ID,
    [AppwriteQuery.equal("active", true), AppwriteQuery.orderAsc("order")],
  );

  return response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;
    return { id: $id, ...(data as Omit<Category, "id">) } as Category;
  });
}

const CategoryService = {
  getCategories,
};

export default CategoryService;
