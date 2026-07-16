import { databases, APPWRITE_DATABASE_ID, APPWRITE_PRODUCTS_COLLECTION_ID, AppwriteQuery, AppwriteID, isAppwriteDataConfigured } from '@/lib/appwrite';

export interface Product {
  id: string;
  brand: string;
  title: string;
  price: string;
  condition: string;
  image: string;
  category: string;
  subCategory: string;
  onlyOneLeft?: boolean;
  description?: string;
  retailPrice?: string;
  measurements?: {
    size?: string;
    chest?: string;
    length?: string;
    shoulders?: string;
  };
  shippingInfo?: string;
}

function normalizeProduct(data: any, id?: string): Product {
  const measurements = data.measurements ?? {
    size: data.size ?? '',
    chest: data.chest ?? '',
    length: data.length ?? '',
    shoulders: data.shoulders ?? '',
  };

  return {
    id: id ?? data.id ?? '',
    brand: data.brand ?? '',
    title: data.productName ?? data.title ?? '',
    price: data.price ?? '',
    condition: data.condition ?? '',
    image: Array.isArray(data.imageIds) && data.imageIds.length ? data.imageIds[0] : data.image ?? '',
    category: data.categorySlug ?? data.category ?? '',
    subCategory: data.subCategorySlug ?? data.subCategory ?? '',
    onlyOneLeft: typeof data.stockQuantity === 'number' ? data.stockQuantity <= 1 : false,
    description: data.description ?? data.productDescription ?? data.summary ?? '',
    retailPrice: data.retailPrice ?? data.retail_price ?? '',
    measurements: {
      size: measurements.size ?? '',
      chest: measurements.chest ?? '',
      length: measurements.length ?? '',
      shoulders: measurements.shoulders ?? '',
    },
    shippingInfo: data.shippingInfo ?? data.shippingDetails ?? '',
  } as Product;
}

export async function seedProducts(initialProducts: Omit<Product, 'id'>[]) {
  if (!isAppwriteDataConfigured) {
    return { seeded: false, fallback: true };
  }

  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_PRODUCTS_COLLECTION_ID, [AppwriteQuery.limit(1)]);
    if (existing.documents.length === 0) {
      for (const product of initialProducts) {
        const payload = {
          productName: product.title,
          brand: product.brand,
          description: product.title,
          price: product.price,
          stockQuantity: product.onlyOneLeft ? 1 : 5,
          categorySlug: product.category,
          subCategorySlug: product.subCategory,
          imageIds: product.image ? [product.image] : [],
        } as any;

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_PRODUCTS_COLLECTION_ID,
          AppwriteID.unique(),
          payload,
          []
        );
      }
      return { seeded: true };
    }
    return { seeded: false };
  } catch (err) {
    console.error('seedProducts error', err);
    throw err;
  }
}

export async function getProducts(category?: string, subCategory?: string, pageSize = 48): Promise<Product[]> {
  if (!isAppwriteDataConfigured) {
    console.error('Appwrite dynamic product data unavailable. Set NEXT_PUBLIC_APPWRITE_* env vars.');
    return [];
  }

  const queries: any[] = [];
  if (category) queries.push(AppwriteQuery.equal('categorySlug', category));
  if (subCategory) queries.push(AppwriteQuery.equal('subCategorySlug', subCategory));
  queries.push(AppwriteQuery.orderAsc('productName'));
  queries.push(AppwriteQuery.limit(pageSize));

  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_PRODUCTS_COLLECTION_ID, queries);
  return response.documents.map((doc: any) => {
    const { $id, $collection, $database, ...data } = doc;
    return normalizeProduct({ ...data, id: $id }, $id);
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isAppwriteDataConfigured) {
    console.error('Appwrite dynamic product data unavailable. Set NEXT_PUBLIC_APPWRITE_* env vars.');
    return null;
  }

  try {
    const document = await databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_PRODUCTS_COLLECTION_ID, id);
    const { $id, $collection, $database, ...data } = document as any;
    return normalizeProduct({ ...data, id: $id }, $id);
  } catch (err) {
    console.error('[getProductById] error', err);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isAppwriteDataConfigured) {
    console.error('Appwrite dynamic product data unavailable. Set NEXT_PUBLIC_APPWRITE_* env vars.');
    return null;
  }

  const queries: any[] = [AppwriteQuery.equal('slug', slug), AppwriteQuery.limit(1)];
  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_PRODUCTS_COLLECTION_ID, queries);
  if (response.documents.length === 0) return null;
  const doc = response.documents[0];
  const { $id, $collection, $database, ...data } = doc;
  return normalizeProduct({ ...data, id: $id }, $id);
}

export default {
  getProducts,
  getProductById,
  getProductBySlug,
  seedProducts,
};
