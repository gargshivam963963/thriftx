import { Client, Databases, Storage } from "node-appwrite";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);

export const storage = new Storage(client);

export const APPWRITE = {
  DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  PRODUCTS_COLLECTION_ID:
    process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!,
  BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
};
