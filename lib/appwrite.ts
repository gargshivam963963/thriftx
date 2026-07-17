import { Client, Account, Databases, Query, ID } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "";
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const productsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || "";
const categoriesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || "";
const subCategoriesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_SUBCATEGORIES_COLLECTION_ID || "";
const cartItemsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CART_ITEMS_COLLECTION_ID || "";
const addressesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ADDRESSES_COLLECTION_ID || "";
const ordersCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "";

const client = new Client();

const appwriteEndpointConfigured = Boolean(endpoint && project);
const appwriteDataConfigured = Boolean(
  appwriteEndpointConfigured &&
  databaseId &&
  productsCollectionId &&
  categoriesCollectionId &&
  subCategoriesCollectionId &&
  cartItemsCollectionId &&
  addressesCollectionId,
);

if (!appwriteEndpointConfigured) {
  // Do not call setEndpoint/setProject with empty values — provide a helpful message.
  // Runtime code that actually calls Appwrite APIs should ensure these env vars are set.
  // This avoids the Appwrite SDK throwing "Endpoint must be a valid string" during server startup.
  // eslint-disable-next-line no-console
  console.warn(
    "Appwrite endpoint/project not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT in your environment.",
  );
} else {
  client.setEndpoint(endpoint).setProject(project);
}

if (process.env.APPWRITE_API_KEY) {
  client.setJWT(process.env.APPWRITE_API_KEY);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const AppwriteQuery = Query;
export const AppwriteID = ID;

export const APPWRITE_DATABASE_ID = databaseId;
export const APPWRITE_PRODUCTS_COLLECTION_ID = productsCollectionId;
export const APPWRITE_CATEGORIES_COLLECTION_ID = categoriesCollectionId;
export const APPWRITE_SUBCATEGORIES_COLLECTION_ID = subCategoriesCollectionId;
export const isAppwriteEndpointConfigured = appwriteEndpointConfigured;
export const isAppwriteDataConfigured = appwriteDataConfigured;
export const APPWRITE_CART_ITEMS_COLLECTION_ID = cartItemsCollectionId;
export const APPWRITE_ADDRESSES_COLLECTION_ID = addressesCollectionId;
export const APPWRITE_ORDERS_COLLECTION_ID = ordersCollectionId;
