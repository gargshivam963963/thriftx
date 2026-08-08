import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type { Gender, Category } from "@/lib/categories";

/**
 * CatalogRepository — reads genders, categories, and brands from PostgreSQL.
 *
 * These are static, rarely-changing catalog lists. We map them back to the
 * existing `Gender` / `Category` shapes from `lib/categories.ts` so the UI
 * and pages don't need to change.
 */

export async function getGenders(): Promise<Gender[]> {
  if (!isDatabaseConfigured) return [];

  // Genders are derived from the distinct `gender` field on categories.
  const rows = await prisma!.category.findMany({
    where: { active: true },
    select: { gender: true },
    distinct: ["gender"],
  });

  const order = ["Men", "Women", "Kids", "Unisex"];

  return rows
    .map((r) => r.gender)
    .sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map((name) => ({
      id: `gender-${name.toLowerCase()}`,
      slug: name.toLowerCase(),
      name,
    }));
}

export async function getCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured) return [];

  const rows = await prisma!.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    gender: r.gender as Category["gender"],
    order: r.order,
    active: r.active,
    image: r.image ?? "",
  }));
}

export async function getBrands(): Promise<string[]> {
  if (!isDatabaseConfigured) return [];

  const rows = await prisma!.brand.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return rows.map((r) => r.name);
}
