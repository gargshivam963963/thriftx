import { Client, Databases } from "node-appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export const PRODUCTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;

export const CATEGORIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;

export const GENDERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GENDERS_COLLECTION_ID!;
