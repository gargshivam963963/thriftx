import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getBrands as getBrandNames } from "./brandRepository";
import type { Gender, Category } from "@/lib/categories";

/**
 * CatalogRepository — reads genders and categories from PostgreSQL.
 *
 * These are static, rarely-changing catalog lists. We map them back to the
 * existing `Gender` / `Category` shapes from `lib/categories.ts` so the UI
 * and pages don't need to change.
 *
 * Brand reads live in `brandRepository` and are re-exported here for
 * convenience/backwards compatibility.
 */

export async function getGenders(): Promise<Gender[]> {
  if (!isDatabaseConfigured) return [];

  try {
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
  } catch (error) {
    console.error("getGenders error:", error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured) return [];

  try {
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
  } catch (error) {
    console.error("getCategories error:", error);
    return [];
  }
}

export async function getBrands(): Promise<string[]> {
  return getBrandNames();
}
