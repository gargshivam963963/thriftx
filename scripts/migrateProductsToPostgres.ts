/**
 * THRIFTX — One-time data migration: Appwrite Products → PostgreSQL (Neon)
 *
 * Phase 1 migration helper. Reads all product documents from the Appwrite
 * Products collection and seeds them into PostgreSQL via the repository
 * layer (`productRepository.importProducts` → Prisma).
 *
 * Image file IDs stored in Appwrite are converted to full view URLs using
 * `storage.getFileView(bucketId, fileId)`, matching the shape the app expects.
 *
 * The script is idempotent: each Appwrite product is upserted by its original
 * document ID and its image rows are synchronized without deleting Appwrite data.
 *
 * Usage:
 *   npx tsx scripts/migrateProductsToPostgres.ts
 */

import "dotenv/config";
import { Client, Databases, Storage, Query } from "node-appwrite";

import { importProducts } from "../lib/services/products";

// ── Appwrite client (server-side) ──────────────────────────────────────────
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PRODUCTS_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
const BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

function fileIdToUrl(fileId: string): string {
  if (fileId.startsWith("http")) return fileId;
  return storage.getFileView(BUCKET, fileId).toString();
}

async function fetchAllProducts() {
  const all: Record<string, unknown>[] = [];
  const BATCH = 100;
  let cursor: string | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const queries = [Query.limit(BATCH), Query.orderAsc("$id")];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(DB, PRODUCTS_COLLECTION, queries);
    all.push(...res.documents);
    if (res.documents.length < BATCH) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }

  return all;
}

async function migrate() {
  console.log("📦 Reading products from Appwrite...");
  const docs = await fetchAllProducts();
  console.log(`   Found ${docs.length} products in Appwrite.`);

  if (docs.length === 0) {
    console.log("   Nothing to migrate.");
    return;
  }

  const products = docs.map((doc) => {
    const rawImages: unknown = (doc as Record<string, unknown>).images;
    const images = Array.isArray(rawImages)
      ? (rawImages as string[]).filter(Boolean).map(fileIdToUrl)
      : [];

    const primary = images[0] ?? "";

    return {
      id: String(doc.$id),
      title: String((doc as Record<string, unknown>).title ?? "Untitled"),
      brand: String((doc as Record<string, unknown>).brand ?? ""),
      slug: String((doc as Record<string, unknown>).slug ?? ""),
      category: String((doc as Record<string, unknown>).category ?? ""),
      categorySlug: String((doc as Record<string, unknown>).categorySlug ?? ""),
      gender: (doc as Record<string, unknown>).gender as
        | "Men"
        | "Women"
        | "Kids"
        | "Unisex",
      price: Number((doc as Record<string, unknown>).price ?? 0),
      retailPrice:
        (doc as Record<string, unknown>).retailPrice !== undefined
          ? Number((doc as Record<string, unknown>).retailPrice)
          : undefined,
      condition: String((doc as Record<string, unknown>).condition ?? ""),
      size: String((doc as Record<string, unknown>).size ?? ""),
      chest: String((doc as Record<string, unknown>).chest ?? ""),
      waist: String((doc as Record<string, unknown>).waist ?? ""),
      length: String((doc as Record<string, unknown>).length ?? ""),
      inseam: String((doc as Record<string, unknown>).inseam ?? ""),
      color: String((doc as Record<string, unknown>).color ?? ""),
      material: String((doc as Record<string, unknown>).material ?? ""),
      description: String((doc as Record<string, unknown>).description ?? ""),
      shippingInfo: String((doc as Record<string, unknown>).shippingInfo ?? ""),
      primaryImage: primary,
      images,
      status: (doc.status === "draft" || doc.status === "sold"
        ? doc.status
        : "active") as "draft" | "active" | "sold",
      isActive:
        (doc as Record<string, unknown>).isActive !== false &&
        (doc as Record<string, unknown>).status !== "draft",
    };
  });

  console.log(`🌱 Importing ${products.length} products into PostgreSQL...`);
  const result = await importProducts(products);
  console.log("✅ Done:", result);
}

migrate().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
