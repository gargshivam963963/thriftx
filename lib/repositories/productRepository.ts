import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createProductImageUrl } from "@/lib/storage/r2Download";
import { getBrands as getBrandNames } from "./brandRepository";
import type { Prisma } from "@/generated/prisma/client";
import type { Product, ProductFilters } from "@/lib/services/products";

/**
 * ProductRepository — the ONLY place that reads products from PostgreSQL.
 *
 * Pages and services depend on the existing `Product` shape from
 * `lib/services/products.ts`, so we map Prisma rows back to that shape here.
 * All functions return empty arrays / null when the DB is not configured,
 * so the app never crashes during the migration window.
 */

const PRODUCT_SELECT = {
  id: true,
  title: true,
  brand: true,
  slug: true,
  category: true,
  categorySlug: true,
  gender: true,
  price: true,
  retailPrice: true,
  condition: true,
  size: true,
  chest: true,
  waist: true,
  length: true,
  inseam: true,
  color: true,
  material: true,
  description: true,
  shippingInfo: true,
  isActive: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  images: {
    orderBy: { position: "asc" as const },
    select: { url: true, position: true },
  },
} as const;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT }>;

export type ProductImport = Omit<Product, "id"> & { id: string };

function availableInventoryWhere() {
  return {
    OR: [
      { reservationExpiresAt: null },
      { reservationExpiresAt: { lte: new Date() } },
    ],
  };
}

function isMissingReservationColumns(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== "P2022"
  ) {
    return false;
  }

  const meta =
    "meta" in error && typeof error.meta === "object" && error.meta !== null
      ? error.meta
      : null;
  const adapterError =
    meta &&
    "driverAdapterError" in meta &&
    typeof meta.driverAdapterError === "object" &&
    meta.driverAdapterError !== null
      ? meta.driverAdapterError
      : null;
  const cause =
    adapterError &&
    "cause" in adapterError &&
    typeof adapterError.cause === "object" &&
    adapterError.cause !== null
      ? adapterError.cause
      : null;
  const column =
    (cause && "column" in cause && typeof cause.column === "string"
      ? cause.column
      : "") ||
    (meta && "column" in meta && typeof meta.column === "string"
      ? meta.column
      : "");

  return (
    column.includes("reservedBy") ||
    column.includes("reservationId") ||
    column.includes("reservationExpiresAt")
  );
}

function withAvailability(
  where: Prisma.ProductWhereInput,
): Prisma.ProductWhereInput {
  const existingAnd = where.AND
    ? Array.isArray(where.AND)
      ? where.AND
      : [where.AND]
    : [];

  return {
    ...where,
    isActive: true,
    status: "active",
    AND: [...existingAnd, availableInventoryWhere()],
  };
}

async function findManyAvailable(
  where: Prisma.ProductWhereInput,
  options: {
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    skip?: number;
    take?: number;
  } = {},
): Promise<ProductRow[]> {
  const query = {
    select: PRODUCT_SELECT,
    ...options,
  };

  try {
    return await prisma!.product.findMany({
      ...query,
      where: withAvailability(where),
    });
  } catch (error) {
    if (!isMissingReservationColumns(error)) throw error;

    console.warn(
      "Product reservation migration is not applied; using legacy product availability.",
    );
    return prisma!.product.findMany({ ...query, where });
  }
}

async function findFirstAvailable(
  where: Prisma.ProductWhereInput,
): Promise<ProductRow | null> {
  try {
    return await prisma!.product.findFirst({
      where: withAvailability(where),
      select: PRODUCT_SELECT,
    });
  } catch (error) {
    if (!isMissingReservationColumns(error)) throw error;

    console.warn(
      "Product reservation migration is not applied; using legacy product availability.",
    );
    return prisma!.product.findFirst({ where, select: PRODUCT_SELECT });
  }
}

async function getRows() {
  if (!isDatabaseConfigured) return null;
  try {
    return await findManyAvailable({ isActive: true, status: "active" });
  } catch (error) {
    console.error("getRows error:", error);
    return null;
  }
}

async function mapProduct(row: ProductRow): Promise<Product> {
  const images = await Promise.all(
    row.images.map((image) => createProductImageUrl(image.url)),
  );

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
  return Promise.all(rows.map(mapProduct));
}

/**
 * Builds the Prisma `where` clause shared by listing AND counting, so the
 * "x of y" counts on a paginated page can never drift from the rows shown.
 */
function buildProductWhere(
  filters: ProductFilters = {},
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
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

  // `sort=sale` is a *filter*, not an ordering: only pieces whose retail (MRP)
  // price is above our selling price. Prisma compares the two columns in SQL via
  // a field reference, so the count and the rows always agree. Products with no
  // MRP recorded are excluded — we never invent a fake "original price".
  // These go into `AND` rather than directly on `where.price`, so a shopper
  // combining "Sale" with a price-range facet keeps both constraints instead of
  // the last one silently winning.
  if (filters.sort === "sale" && prisma) {
    const saleConditions: Prisma.ProductWhereInput[] = [
      { retailPrice: { not: null } },
      { price: { lt: prisma.product.fields.retailPrice } },
    ];
    where.AND = Array.isArray(where.AND)
      ? [...where.AND, ...saleConditions]
      : where.AND
        ? [where.AND, ...saleConditions]
        : saleConditions;
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

  return where;
}

export async function getProductsByFilters(
  filters: ProductFilters = {},
): Promise<Product[]> {
  if (!isDatabaseConfigured) return [];

  const where = buildProductWhere(filters);

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "sale":
      // Biggest markdown first — the only ordering that gives "Sale" a reason
      // to exist as its own destination.
      orderBy = { retailPrice: "desc" };
      break;
    case "name":
      orderBy = { title: "asc" };
      break;
    default:
      // "newest" and "popular" collapse to recency on purpose: the catalogue
      // has no sales-volume signal, so inventing a popularity rank would be
      // fake data. Recency is the honest proxy.
      orderBy = { createdAt: "desc" };
      break;
  }

  const MAX_LIMIT = 100;
  const requested = filters.limit ?? 48;
  const take = Math.min(Math.max(1, requested), MAX_LIMIT);

  const rows = await findManyAvailable(where, {
      orderBy,
      skip: Math.max(0, filters.offset ?? 0),
      take,
    }).catch((error: unknown) => {
      console.error("getProductsByFilters error:", error);
      return [];
    });

  return Promise.all(rows.map(mapProduct));
}

/**
 * Counts every product matching the same filters as {@link getProductsByFilters}.
 *
 * Required by real pagination: without it the UI has to guess a total from the
 * rows it happens to have loaded, which is what made the shop page report fewer
 * pieces than the catalog actually holds.
 */
export async function countProductsByFilters(
  filters: ProductFilters = {},
): Promise<number> {
  if (!isDatabaseConfigured) return 0;

  try {
    return await prisma!.product.count({ where: withAvailability(buildProductWhere(filters)) });
  } catch (error) {
    if (!isMissingReservationColumns(error)) {
      console.error("countProductsByFilters error:", error);
      return 0;
    }

    console.warn(
      "Product reservation migration is not applied; using legacy product counts.",
    );
    return prisma!.product.count({ where: buildProductWhere(filters) });
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isDatabaseConfigured) return null;
  try {
    const row = await findFirstAvailable({
      slug,
      isActive: true,
      status: "active",
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
    const row = await findFirstAvailable({
      id,
      isActive: true,
      status: "active",
    });
    if (!row) return null;
    return mapProduct(row);
  } catch (error) {
    console.error("getProductById error:", error);
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!isDatabaseConfigured || ids.length === 0) return [];
  const rows = await findManyAvailable({
      id: { in: [...new Set(ids)] },
      isActive: true,
      status: "active",
  });
  return Promise.all(rows.map(mapProduct));
}

export async function getSimilarProducts(
  product: Product,
  limit = 6,
): Promise<Product[]> {
  if (!isDatabaseConfigured) return [];

  const candidates = await findManyAvailable(
      {
        isActive: true,
        status: "active",
        id: { not: product.id },
      },
      { take: 100 },
    )
    .catch((error) => {
      console.error("getSimilarProducts error:", error);
      return [];
    });

  const mappedCandidates = await Promise.all(candidates.map(mapProduct));
  const scored = mappedCandidates.map((mapped) => {
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
    const where: Prisma.ProductWhereInput = {
        isActive: true,
        status: "active",
      };
    let rows: { slug: string; updatedAt: Date }[];
    try {
      rows = await prisma!.product.findMany({
        where: withAvailability(where),
        select: { slug: true, updatedAt: true },
      });
    } catch (error) {
      if (!isMissingReservationColumns(error)) throw error;
      console.warn(
        "Product reservation migration is not applied; using legacy sitemap availability.",
      );
      rows = await prisma!.product.findMany({
        where,
        select: { slug: true, updatedAt: true },
      });
    }
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
 * Import products from the legacy catalog without changing their IDs.
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
    if (!product.id) throw new Error("Product is missing its ID");
    if (!product.slug) {
      throw new Error(`Product ${product.id} is missing a slug`);
    }
    if (ids.has(product.id)) {
      throw new Error(`Duplicate product ID: ${product.id}`);
    }
    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate product slug: ${product.slug}`);
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
        `Slug collision for "${owner.slug}": imported ID ${source.id} conflicts with PostgreSQL ID ${owner.id}`,
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

  const rows = await findManyAvailable(
    {
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
    {
      take: limit,
      orderBy: { createdAt: "desc" },
    },
  ).catch((error) => {
    console.error("searchProducts error:", error);
    return [];
  });

  return Promise.all(rows.map(mapProduct));
}
