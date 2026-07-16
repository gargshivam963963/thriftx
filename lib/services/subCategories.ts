import { databases, APPWRITE_DATABASE_ID, APPWRITE_SUBCATEGORIES_COLLECTION_ID, AppwriteQuery, isAppwriteDataConfigured } from '@/lib/appwrite';

export interface SubCategory {
  id: string;
  name?: string;
  slug?: string;
  category?: string;
  active?: boolean;
  order?: number;
}

export async function getSubCategories(categorySlug: string): Promise<SubCategory[]> {
  if (!isAppwriteDataConfigured) {
    console.error('Appwrite dynamic subcategory data unavailable. Set NEXT_PUBLIC_APPWRITE_* env vars.');
    return [];
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUBCATEGORIES_COLLECTION_ID,
    [
      AppwriteQuery.equal('categorySlug', categorySlug),
      AppwriteQuery.equal('active', true),
      AppwriteQuery.orderAsc('order'),
    ]
  );

  return response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;
    return { id: $id, ...(data as Omit<SubCategory, 'id'>) } as SubCategory;
  });
}

export default {
  getSubCategories,
};
