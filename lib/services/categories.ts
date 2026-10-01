import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export interface Category {
  id: string;
  name?: string;
  image?: string;
  order?: number;
  active?: boolean;
  slug?: string;
  gender?: "Men" | "Women" | "Kids" | "Unisex";
}

export async function getCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured || !prisma) {
    return [];
  }

  const rows = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      gender: true,
      order: true,
      active: true,
      image: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    gender: row.gender as Category["gender"],
    order: row.order,
    active: row.active,
    image: row.image ?? undefined,
  }));
}

const CategoryService = {
  getCategories,
};

export default CategoryService;
