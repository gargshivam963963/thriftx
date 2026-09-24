import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/**
 * BrandRepository — reads brands from PostgreSQL.
 *
 * This is the single data-access entry point for brand data. It maps rows
 * back to the plain `string[]` shape consumed by the UI/services so nothing
 * upstream depends on Prisma types directly.
 *
 * All functions return empty arrays when the DB is not configured, so the
 * app never crashes during the migration window.
 */

export async function getBrands(): Promise<string[]> {
  if (!isDatabaseConfigured) return [];

  try {
    const rows = await prisma!.brand.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    });

    return rows.map((r) => r.name);
  } catch (error) {
    // Table may not exist yet (migration not applied) — return gracefully.
    console.error("brandRepository.getBrands error:", error);
    return [];
  }
}

/**
 * Upsert a single brand by name (used by seed/write flows that need to keep
 * the Brand table in sync with product.brand values). Returns the brand name
 * that is now guaranteed to exist.
 */
export async function upsertBrand(name: string): Promise<string | null> {
  if (!isDatabaseConfigured || !name.trim()) return null;

  try {
    await prisma!.brand.upsert({
      where: { name },
      create: { name, slug: slugify(name) },
      update: {},
    });
    return name;
  } catch (error) {
    console.error("brandRepository.upsertBrand error:", error);
    return null;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
