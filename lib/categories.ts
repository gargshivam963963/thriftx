import { databases, APPWRITE_DATABASE_ID, APPWRITE_CATEGORIES_COLLECTION_ID, APPWRITE_SUBCATEGORIES_COLLECTION_ID, AppwriteQuery, isAppwriteDataConfigured } from './appwrite';

type Category = {
  id: string;
  slug: string;
  name: string;
};

type SubCategory = {
  id: string;
  slug: string;
  name: string;
  category: string;
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-men', slug: 'men', name: 'Men' },
  { id: 'cat-women', slug: 'women', name: 'Women' },
  { id: 'cat-vintage', slug: 'vintage', name: 'Vintage' },
];

const FALLBACK_SUBCATEGORIES: SubCategory[] = [
  { id: 'sub-jeans', slug: 'jeans', name: 'Jeans', category: 'men' },
  { id: 'sub-hoodies', slug: 'hoodies', name: 'Hoodies', category: 'men' },
  { id: 'sub-jackets', slug: 'jackets', name: 'Jackets', category: 'men' },
  { id: 'sub-dresses', slug: 'dresses', name: 'Dresses', category: 'women' },
  { id: 'sub-t-shirts', slug: 't-shirts', name: 'T-Shirts', category: 'men' },
  { id: 'sub-dresses-women', slug: 'dresses', name: 'Dresses', category: 'women' },
  { id: 'sub-outerwear', slug: 'outerwear', name: 'Outerwear', category: 'vintage' },
];

export async function getCategories() {
  if (!isAppwriteDataConfigured) {
    return FALLBACK_CATEGORIES;
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_CATEGORIES_COLLECTION_ID,
    [AppwriteQuery.equal('active', true), AppwriteQuery.orderAsc('order')]
  );

  return response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;
    return {
      id: $id,
      ...data,
    };
  });
}

export async function getSubCategories(category: string) {
  if (!isAppwriteDataConfigured) {
    return FALLBACK_SUBCATEGORIES.filter((sub) => sub.category === category);
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_SUBCATEGORIES_COLLECTION_ID,
    [
        AppwriteQuery.equal('categorySlug', category),
      AppwriteQuery.equal('active', true),
      AppwriteQuery.orderAsc('order'),
    ]
  );

  return response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;
    return {
      id: $id,
      ...data,
    };
  });
}
