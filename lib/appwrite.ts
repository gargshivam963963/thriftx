import { Client, Account, Databases, Storage, Query, ID } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

const productsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || "";

const gendersCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_GENDERS_COLLECTION_ID || "";

const categoriesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || "";

const cartItemsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CART_ITEMS_COLLECTION_ID || "";

const addressesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ADDRESSES_COLLECTION_ID || "";

const ordersCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "";

const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

const client = new Client();

const appwriteEndpointConfigured = Boolean(endpoint && project);

const appwriteDataConfigured = Boolean(
  appwriteEndpointConfigured &&
  databaseId &&
  productsCollectionId &&
  gendersCollectionId &&
  categoriesCollectionId &&
  cartItemsCollectionId &&
  addressesCollectionId &&
  ordersCollectionId &&
  bucketId,
);

if (!appwriteEndpointConfigured) {
  console.warn(
    "Appwrite endpoint/project not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT in your environment.",
  );
} else {
  client.setEndpoint(endpoint).setProject(project);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const AppwriteQuery = Query;
export const AppwriteID = ID;

export const APPWRITE_DATABASE_ID = databaseId;

export const APPWRITE_PRODUCTS_COLLECTION_ID = productsCollectionId;

export const APPWRITE_GENDERS_COLLECTION_ID = gendersCollectionId;

export const APPWRITE_CATEGORIES_COLLECTION_ID = categoriesCollectionId;

export const APPWRITE_CART_ITEMS_COLLECTION_ID = cartItemsCollectionId;

export const APPWRITE_ADDRESSES_COLLECTION_ID = addressesCollectionId;

export const APPWRITE_ORDERS_COLLECTION_ID = ordersCollectionId;

export const APPWRITE_BUCKET_ID = bucketId;

export const isAppwriteEndpointConfigured = appwriteEndpointConfigured;

export const isAppwriteDataConfigured = appwriteDataConfigured;

export function getFileViewUrl(fileId: string) {
  return storage.getFileView(APPWRITE_BUCKET_ID, fileId).toString();
}
