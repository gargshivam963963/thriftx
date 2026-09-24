/**
 * THRIFTX — Seed PostgreSQL (Neon) with categories + products.
 *
 * Phase 1 bootstrap: populates the empty Postgres catalog so the storefront
 * (which now reads exclusively from Prisma/PostgreSQL) shows data.
 *
 * - Categories: creates the full Men/Women/Kids/Unisex catalog list.
 * - Products: reads `scripts/bulk/products.csv` and seeds each row using the
 *   local product image at `/products/jeans1.jpg` (or a per-sku image under
 *   `scripts/bulk/images/` if present).
 *
 * Idempotent: existing categories/products are left untouched.
 *
 * Usage:
 *   npx tsx scripts/seedPostgres.ts
 */

import "dotenv/config";
import path from "path";
import fs from "fs";

import { prisma, isDatabaseConfigured } from "../lib/prisma";

// ── Categories (mirrors the storefront nav) ─────────────────────────────────
const CATEGORIES: {
  name: string;
  slug: string;
  gender: "Men" | "Women" | "Kids" | "Unisex";
  order: number;
}[] = [
  { name: "T-Shirts", slug: "t-shirts", gender: "Men", order: 1 },
  { name: "Shirts", slug: "shirts", gender: "Men", order: 2 },
  { name: "Jeans", slug: "jeans", gender: "Men", order: 3 },
  { name: "Hoodies", slug: "hoodies", gender: "Men", order: 4 },
  { name: "Jackets", slug: "jackets", gender: "Men", order: 5 },
  { name: "Sweatshirts", slug: "sweatshirts", gender: "Men", order: 6 },
  { name: "Shorts", slug: "shorts", gender: "Men", order: 7 },
  { name: "Trousers", slug: "trousers", gender: "Men", order: 8 },
  { name: "Lower", slug: "lower", gender: "Men", order: 9 },
  { name: "Dresses", slug: "dresses", gender: "Women", order: 10 },
  { name: "Tops", slug: "tops", gender: "Women", order: 11 },
  { name: "Jeans", slug: "jeans", gender: "Women", order: 12 },
  { name: "Skirts", slug: "skirts", gender: "Women", order: 13 },
  { name: "Hoodies", slug: "hoodies", gender: "Women", order: 14 },
  { name: "Jackets", slug: "jackets", gender: "Women", order: 15 },
  { name: "Lower", slug: "lower", gender: "Women", order: 16 },
  { name: "T-Shirts", slug: "t-shirts", gender: "Kids", order: 17 },
  { name: "Shorts", slug: "shorts", gender: "Kids", order: 18 },
  { name: "Jeans", slug: "jeans", gender: "Kids", order: 19 },
  { name: "Hoodies", slug: "hoodies", gender: "Kids", order: 20 },
  { name: "Lower", slug: "lower", gender: "Kids", order: 21 },
  { name: "Hoodies", slug: "hoodies", gender: "Unisex", order: 22 },
  { name: "Jackets", slug: "jackets", gender: "Unisex", order: 23 },
  { name: "Sweatshirts", slug: "sweatshirts", gender: "Unisex", order: 24 },
  { name: "Lower", slug: "lower", gender: "Unisex", order: 25 },
];

async function seedCategories() {
  console.log("🏷  Seeding categories...");

  for (const c of CATEGORIES) {
    const existing = await prisma!.category.findUnique({
      where: { slug_gender: { slug: c.slug, gender: c.gender } },
    });

    if (existing) {
      console.log(`   ⏩ Skipped ${c.gender} → ${c.name}`);
      continue;
    }

    await prisma!.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        gender: c.gender,
        order: c.order,
        active: true,
        image: "",
      },
    });
    console.log(`   ✅ Created ${c.gender} → ${c.name}`);
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedProducts() {
  console.log("\n📦 Seeding products...");

  const csvPath = path.join(process.cwd(), "scripts", "bulk", "products.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   No products.csv found — skipping product seeding.");
    return;
  }

  // Dynamic import of csv-parser (ESM).
  const { default: csv } = await import("csv-parser");
  const rows = await new Promise<Record<string, string>[]>((resolve, reject) => {
    const out: Record<string, string>[] = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (r: Record<string, string>) => out.push(r))
      .on("end", () => resolve(out))
      .on("error", reject);
  });

  let created = 0;
  for (const row of rows) {
    const title = String(row.title ?? "").trim();
    if (!title) continue;

    const slug = slugify(title);
    const existing = await prisma!.product.findUnique({ where: { slug } });
    if (existing) {
      console.log(`   ⏩ Skipped ${title} (already exists)`);
      continue;
    }

    // Deterministically pick images: prefer per-sku image in bulk/images,
    // otherwise fall back to the shared jeans1.jpg.
    const sku = String(row.sku ?? "").trim();
    const imageDir = path.join(process.cwd(), "scripts", "bulk", "images");
    const skuImage = fs
      .readdirSync(imageDir)
      .filter((f) => f.startsWith(`${sku}-`))
      .sort()
      .map((f) => `/images/${f}`);

const images =
      skuImage.length > 0 ? skuImage : ["/products/jeans1.jpg"];

    const brandName = String(row.brand ?? "").trim() || "THRIFTX";
    const categoryName = String(row.category ?? "").trim() || "Jeans";
    const categorySlug = slugify(categoryName);
    const productGender = (String(row.gender ?? "Men").trim() || "Men") as
      | "Men"
      | "Women"
      | "Kids"
      | "Unisex";

    // Ensure the Brand row exists (Product.brand → Brand.name FK).
    await prisma!.brand.upsert({
      where: { name: brandName },
      create: { name: brandName, slug: slugify(brandName) },
      update: {},
    });

    // Ensure the Category row exists (Product.categorySlug+gender → Category).
    await prisma!.category.upsert({
      where: { slug_gender: { slug: categorySlug, gender: productGender } },
      create: {
        name: categoryName,
        slug: categorySlug,
        gender: productGender,
        order: 99,
        active: true,
        image: "",
      },
      update: {},
    });

await prisma!.product.create({
      data: {
        title,
        brand: brandName,
        slug,
        category: categoryName,
        categorySlug,
        gender: productGender,
        price: Number(row.price ?? 0) || 0,
        retailPrice: Number(row.retailPrice ?? 0) || null,
        condition: String(row.condition ?? "").trim() || "Excellent",
        size: String(row.size ?? "").trim() || "M",
        color: String(row.color ?? "").trim() || "",
        material: String(row.material ?? "").trim() || "",
        description: String(row.description ?? "").trim() || "",
        shippingInfo: String(row.shippingInfo ?? "").trim() || "",
        status: "active",
        isActive: true,
        images: {
          create: images.map((url, position) => ({ url, position })),
        },
      },
    });
    created++;
    console.log(`   ✅ Created ${title}`);
  }

  console.log(`   Total created: ${created}`);
}

async function main() {
  if (!isDatabaseConfigured) {
    console.error(
      "❌ DATABASE_URL is not configured. Set a real Neon connection string in .env and re-run.",
    );
    process.exit(1);
  }

  console.log("🌱 Seeding PostgreSQL (Neon)...\n");

  await seedCategories();
  await seedProducts();

  const productCount = await prisma!.product.count();
  const categoryCount = await prisma!.category.count();
  const brandCount = await prisma!.brand.count();

  console.log("\n🎉 Seeding complete.");
  console.log(`   Products: ${productCount}`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Brands: ${brandCount}`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
