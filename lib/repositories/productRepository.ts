import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getBrands as getBrandNames } from "./brandRepository";
import type { Product, ProductFilters } from "@/lib/services/products";

/**
 * ProductRepository — the ONLY place that reads products from PostgreSQL.
 *
 * Pages and services depend on the existing `Product` shape from
 * `lib/services/products.ts`, so we map Prisma rows back to that shape here.
 * All functions return empty arrays / null when the DB is not configured,
 * so the app never crashes during the migration window.
 */

type ProductRow = Exclude<Awaited<ReturnType<typeof getRows>>, null>[number];

export type ProductImport = Omit<Product, "id"> & { id: string };

async function getRows() {
  if (!isDatabaseConfigured) return null;
  try {
    return await prisma!.product.findMany({
      where: { isActive: true, status: "active" },
      include: { images: { orderBy: { position: "asc" } } },
    });
  } catch (error) {
    // Table may not exist yet (migration not applied) — return null gracefully.
    console.error("getRows error:", error);
    return null;
  }
}

function mapProduct(row: ProductRow): Product {
  const images = row.images
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    slug: row.slug,
    category: row.category,
    categorySlug: row.categorySlug,
    gender: row.gender as Product["gender"],
    price: row.price,
    retailPrice: row.retailPrice ?? undefined,
    condition: row.condition,
    size: row.size,
    chest: row.chest ?? "",
    waist: row.waist ?? "",
    length: row.length ?? "",
    inseam: row.inseam ?? "",
    color: row.color ?? "",
    material: row.material,
    description: row.description ?? "",
    shippingInfo: row.shippingInfo ?? "",
    primaryImage: images[0] ?? "",
    images,
    status: row.status as Product["status"],
    isActive: row.isActive,
    $createdAt: row.createdAt.toISOString(),
    $updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await getRows();
  if (!rows) return [];
  return rows.map(mapProduct);
}

export async function getProductsByFilters(
  filters: ProductFilters = {},
): Promise<Product[]> {
  if (!isDatabaseConfigured) return [];

  const where: Record<string, unknown> = {
    isActive: true,
    status: "active",
  };

  if (filters.gender) {
    const g =
      filters.gender.charAt(0).toUpperCase() +
      filters.gender.slice(1).toLowerCase();
    if (g === "Men" || g === "Women") {
      where.gender = { in: [g, "Unisex"] };
    } else {
      where.gender = g;
    }
  }

  if (filters.category) {
    const categoryName = filters.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("-");
    where.category = { in: [categoryName, filters.category] };
  }

  if (filters.brand?.length) {
    where.brand = { in: filters.brand };
  }

  if (filters.condition?.length) {
    where.condition = { in: filters.condition };
  }

  if (filters.size?.length) {
    where.size = { in: filters.size };
  }

  if (filters.color) {
    where.color = filters.color;
  }

  if (filters.material) {
    where.material = filters.material;
  }

  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { color: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  if (filters.price) {
    switch (filters.price) {
      case "0-499":
        where.price = { lte: 499 };
        break;
      case "500-999":
        where.price = { gte: 500, lte: 999 };
        break;
      case "1000-1499":
        where.price = { gte: 1000, lte: 1499 };
        break;
      case "1500+":
        where.price = { gte: 1500 };
        break;
    }
  }

  let orderBy: Record<string, unknown> = { title: "asc" };
  switch (filters.sort) {
    case "newest":
    case "popular":
      orderBy = { createdAt: "desc" };
      break;
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
  }

  const MAX_LIMIT = 100;
  const requested = filters.limit ?? 48;
  const take = Math.min(Math.max(1, requested), MAX_LIMIT);

  const rows = await prisma!.product
    .findMany({
      where,
      orderBy,
      include: { images: { orderBy: { position: "asc" } } },
      skip: Math.max(0, filters.offset ?? 0),
      take,
    })
    .catch((error) => {
      console.error("getProductsByFilters error:", error);
      return [];
    });

  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isDatabaseConfigured) return null;
  try {
    const row = await prisma!.product.findFirst({
      where: { slug, isActive: true, status: "active" },
      include: { images: { orderBy: { position: "asc" } } },
    });
    if (!row) return null;
    return mapProduct(row);
  } catch (error) {
    console.error("getProductBySlug error:", error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isDatabaseConfigured) return null;
  try {
    const row = await prisma!.product.findFirst({
      where: { id, isActive: true, status: "active" },
      include: { images: { orderBy: { position: "asc" } } },
    });
    if (!row) return null;
    return mapProduct(row);
  } catch (error) {
    console.error("getProductById error:", error);
    return null;
  }
}

export async function getSimilarProducts(
  product: Product,
  limit = 6,
): Promise<Product[]> {
  if (!isDatabaseConfigured) return [];

  const candidates = await prisma!.product
    .findMany({
      where: {
        isActive: true,
        status: "active",
        id: { not: product.id },
      },
      include: { images: { orderBy: { position: "asc" } } },
      take: 200,
    })
    .catch((error) => {
      console.error("getSimilarProducts error:", error);
      return [];
    });

  const scored = candidates.map((candidate) => {
    const mapped = mapProduct(candidate);
    const sharedCategory = mapped.category === product.category ? 4 : 0;
    const sharedBrand = mapped.brand === product.brand ? 4 : 0;
    const sharedColor =
      mapped.color &&
      product.color &&
      mapped.color.toLowerCase() === product.color.toLowerCase()
        ? 3
        : 0;
    const sharedSize =
      mapped.size &&
      product.size &&
      mapped.size.toLowerCase() === product.size.toLowerCase()
        ? 2
        : 0;
    const priceDelta =
      Math.abs(mapped.price - product.price) / Math.max(product.price, 1);
    const priceScore = priceDelta < 0.25 ? 2 : priceDelta < 0.45 ? 1 : 0;
    const categorySimilarity =
      (mapped.category || "")
        .toLowerCase()
        .includes((product.category || "").toLowerCase()) ||
      (product.category || "")
        .toLowerCase()
        .includes((mapped.category || "").toLowerCase())
        ? 2
        : 0;

    return {
      product: mapped,
      score:
        sharedCategory +
        sharedBrand +
        sharedColor +
        sharedSize +
        priceScore +
        categorySimilarity,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export async function getProductsForSitemap(): Promise<
  { slug: string; updatedAt: string }[]
> {
  if (!isDatabaseConfigured) return [];
  try {
    const rows = await prisma!.product.findMany({
      where: { isActive: true, status: "active" },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    // Table may not exist yet (migration not applied) — return empty gracefully.
    console.error("getProductsForSitemap error:", error);
    return [];
  }
}

export async function getBrands(): Promise<string[]> {
  return getBrandNames();
}

export async function seedProducts(
  products: Omit<Product, "id">[],
): Promise<{ seeded: boolean; fallback?: boolean }> {
  if (!isDatabaseConfigured) {
    return { seeded: false, fallback: true };
  }

  const existing = await prisma!.product.count();
  if (existing > 0) {
    return { seeded: false };
  }

  // Upsert brands so the Brand table stays in sync with product.brand values.
  const brandNames = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  for (const name of brandNames) {
    await prisma!.brand.upsert({
      where: { name },
      create: { name, slug: slugify(name) },
      update: {},
    });
  }

  for (const product of products) {
    await prisma!.product.create({
      data: {
        title: product.title,
        brand: product.brand,
        slug: product.slug,
        category: product.category,
        categorySlug: product.categorySlug,
        gender: product.gender,
        price: Number(product.price),
        retailPrice:
          product.retailPrice !== undefined
            ? Number(product.retailPrice)
            : null,
        condition: product.condition,
        size: product.size,
        chest: product.chest ?? null,
        waist: product.waist ?? null,
        length: product.length ?? null,
        inseam: product.inseam ?? null,
        color: product.color ?? null,
        material: product.material,
        description: product.description ?? null,
        shippingInfo: product.shippingInfo ?? null,
        status: product.status,
        isActive: product.isActive,
        images: {
          create: (product.images ?? [])
            .filter(Boolean)
            .map((url, position) => ({ url, position })),
        },
      },
    });
  }

  return { seeded: true };
}

/**
 * Import products from the legacy Appwrite catalog without changing their IDs.
 * Each product is independent so a failed run can be safely resumed.
 */
export async function importProducts(
  products: ProductImport[],
): Promise<{ imported: number; updated: number }> {
  if (!isDatabaseConfigured) {
    throw new Error("DATABASE_URL is not configured");
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const product of products) {
    if (!product.id) throw new Error("Appwrite product is missing its ID");
    if (!product.slug) {
      throw new Error(`Product ${product.id} is missing a slug`);
    }
    if (ids.has(product.id)) {
      throw new Error(`Duplicate Appwrite product ID: ${product.id}`);
    }
    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate Appwrite product slug: ${product.slug}`);
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }

  const existingById = await prisma!.product.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true },
  });
  const existingIds = new Set(existingById.map((product) => product.id));
  const slugOwners = await prisma!.product.findMany({
    where: { slug: { in: [...slugs] } },
    select: { id: true, slug: true },
  });
  for (const owner of slugOwners) {
    const source = products.find((product) => product.slug === owner.slug);
    if (source && source.id !== owner.id) {
      throw new Error(
        `Slug collision for "${owner.slug}": Appwrite ID ${source.id} conflicts with PostgreSQL ID ${owner.id}`,
      );
    }
  }

  let imported = 0;
  let updated = 0;
  for (const product of products) {
    const brandName = product.brand.trim();
    const categorySlug = product.categorySlug || slugify(product.category);
    const gender = product.gender || "Unisex";

    await prisma!.$transaction(async (tx) => {
      if (brandName) {
        const brandSlug = slugify(brandName);
        const brandWithSlug = await tx.brand.findUnique({
          where: { slug: brandSlug },
          select: { name: true },
        });
        if (brandWithSlug && brandWithSlug.name !== brandName) {
          throw new Error(
            `Brand slug collision for "${brandSlug}": "${brandWithSlug.name}" conflicts with "${brandName}"`,
          );
        }
        await tx.brand.upsert({
          where: { name: brandName },
          create: { name: brandName, slug: brandSlug },
          update: { slug: brandSlug },
        });
      }

      await tx.category.upsert({
        where: { slug_gender: { slug: categorySlug, gender } },
        create: {
          name: product.category || categorySlug,
          slug: categorySlug,
          gender,
        },
        update: { name: product.category || categorySlug },
      });

      await tx.product.upsert({
        where: { id: product.id },
        create: {
          id: product.id,
          title: product.title,
          brand: brandName,
          slug: product.slug,
          category: product.category,
          categorySlug,
          gender,
          price: Number(product.price),
          retailPrice:
            product.retailPrice !== undefined
              ? Number(product.retailPrice)
              : null,
          condition: product.condition,
          size: product.size,
          chest: product.chest || null,
          waist: product.waist || null,
          length: product.length || null,
          inseam: product.inseam || null,
          color: product.color || null,
          material: product.material,
          description: product.description || null,
          shippingInfo: product.shippingInfo || null,
          status: product.status,
          isActive: product.isActive,
        },
        update: {
          title: product.title,
          brand: brandName,
          slug: product.slug,
          category: product.category,
          categorySlug,
          gender,
          price: Number(product.price),
          retailPrice:
            product.retailPrice !== undefined
              ? Number(product.retailPrice)
              : null,
          condition: product.condition,
          size: product.size,
          chest: product.chest || null,
          waist: product.waist || null,
          length: product.length || null,
          inseam: product.inseam || null,
          color: product.color || null,
          material: product.material,
          description: product.description || null,
          shippingInfo: product.shippingInfo || null,
          status: product.status,
          isActive: product.isActive,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (product.images.length > 0) {
        await tx.productImage.createMany({
          data: product.images.filter(Boolean).map((url, position) => ({
            productId: product.id,
            url,
            position,
          })),
        });
      }
    });

    if (existingIds.has(product.id)) updated += 1;
    else imported += 1;
  }

  return { imported, updated };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function searchProducts(
  query: string,
  limit = 12,
): Promise<Product[]> {
  if (!isDatabaseConfigured) return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rows = await prisma!.product
    .findMany({
      where: {
        isActive: true,
        status: "active",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { color: { contains: q, mode: "insensitive" } },
          { material: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { images: { orderBy: { position: "asc" } } },
      take: limit,
      orderBy: { createdAt: "desc" },
    })
    .catch((error) => {
      console.error("searchProducts error:", error);
      return [];
    });

  return rows.map(mapProduct);
}
