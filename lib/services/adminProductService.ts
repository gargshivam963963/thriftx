import { prisma, isDatabaseConfigured } from "@/lib/prisma";

/**
 * AdminProductService — server-only product CRUD backed by Prisma.
 *
 * This module MUST remain server-only (it imports `@/lib/prisma`, which pulls
 * in the `pg` driver). It is never imported by client components directly;
 * client pages call the `/api/admin/products` route handler instead.
 */

export interface AdminProduct {
  $id: string;
  $createdAt: string;
  title: string;
  brand: string;
  slug: string;
  category: string;
  gender: string;
  price: number;
  retailPrice?: number;
  condition: string;
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
  inseam?: string;
  color: string;
  material: string;
  description: string;
  shippingInfo?: string;
  primaryImage: string;
  images: string[];
  imageKeys: string[];
  status: string;
  isActive: boolean;
}

export async function getAllProducts(): Promise<AdminProduct[]> {
  if (!isDatabaseConfigured) return [];
  try {
    const products = await prisma!.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return products.map((product) => ({
      $id: product.id,
      $createdAt: product.createdAt.toISOString(),

      title: product.title,
      brand: product.brand,
      slug: product.slug,

      category: product.category,
      gender: product.gender,

      price: product.price,
      retailPrice: product.retailPrice ?? undefined,

      condition: product.condition,
      size: product.size,

      chest: product.chest ?? "",
      waist: product.waist ?? "",
      length: product.length ?? "",
      inseam: product.inseam ?? "",

      color: product.color ?? "",
      material: product.material,

      description: product.description ?? "",
      shippingInfo: product.shippingInfo ?? "",

      primaryImage: product.images[0]?.url ?? "",
      images: product.images.map((image) => image.url),
      imageKeys: product.images.map((image) => image.url),

      status: product.status,
      isActive: product.isActive,
    }));
  } catch (error) {
    console.error("getAllProducts error:", error);
    return [];
  }
}

export async function toggleProductStatus(
  documentId: string,
  isActive: boolean,
): Promise<boolean> {
  try {
    if (isActive) {
      const imageCount = await prisma!.productImage.count({
        where: { productId: documentId },
      });
      if (imageCount === 0) return false;
    }

    await prisma!.product.update({
      where: {
        id: documentId,
      },
      data: {
        isActive,
        status: isActive ? "active" : "draft",
      },
    });

    return true;
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    return false;
  }
}

export async function deleteProduct(documentId: string): Promise<boolean> {
  try {
    await prisma!.product.delete({
      where: {
        id: documentId,
      },
    });

    return true;
  } catch (error) {
    console.error("deleteProduct error:", error);
    return false;
  }
}

export async function createProduct(
  data: Record<string, unknown>,
): Promise<{ productId: string }> {
  if (!isDatabaseConfigured || !prisma) {
    throw new Error("Database is not configured");
  }

  const title = String(data.title ?? "").trim();
  const brand = String(data.brand ?? "").trim();
  const category = String(data.category ?? "").trim();
  const gender = String(data.gender ?? "Unisex");
  const slug = String(data.slug ?? "").trim();
  const categorySlug = String(data.categorySlug ?? slugify(category));
  const price = Number(data.price);
  const material = String(data.material ?? "").trim();

  if (
    !title ||
    !brand ||
    !category ||
    !slug ||
    !material ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "Title, brand, category, slug, material, and a valid price are required",
    );
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.brand.upsert({
      where: { name: brand },
      create: { name: brand, slug: slugify(brand) },
      update: {},
    });

    await tx.category.upsert({
      where: { slug_gender: { slug: categorySlug, gender } },
      create: { name: category, slug: categorySlug, gender },
      update: {},
    });

    return tx.product.create({
      data: {
        title,
        brand,
        slug,
        category,
        categorySlug,
        gender,
        price,
        retailPrice:
          data.retailPrice !== undefined && data.retailPrice !== null
            ? Number(data.retailPrice)
            : null,
        condition: String(data.condition ?? ""),
        size: String(data.size ?? ""),
        chest: data.chest ? String(data.chest) : null,
        waist: data.waist ? String(data.waist) : null,
        length: data.length ? String(data.length) : null,
        inseam: data.inseam ? String(data.inseam) : null,
        color: data.color ? String(data.color) : null,
        material,
        description: data.description ? String(data.description) : null,
        shippingInfo: data.shippingInfo ? String(data.shippingInfo) : null,
        isActive: false,
        status: "draft",
      },
      select: { id: true },
    });
  });

  return { productId: product.id };
}

export async function updateProduct(
  documentId: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (!isDatabaseConfigured || !prisma) {
    throw new Error("Database is not configured");
  }

  const imageInput = data.images;
  let images: string[] | undefined;
  if (Array.isArray(imageInput)) {
    images = imageInput.filter(
      (image): image is string => typeof image === "string",
    );
    if (images.length !== imageInput.length) {
      throw new Error("Image references must be strings");
    }
  }
  if (images && new Set(images).size !== images.length) {
    throw new Error("Duplicate product image references are not allowed");
  }
  if (
    images?.some((image) => {
      if (image.startsWith("/") || /^https?:\/\//i.test(image)) return false;
      return !image.startsWith(`products/${documentId}/`);
    })
  ) {
    throw new Error("Image reference is not a valid key for this product");
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id: documentId },
      select: {
        brand: true,
        category: true,
        categorySlug: true,
        gender: true,
        isActive: true,
        status: true,
      },
    });
    if (!current) throw new Error("Product not found");

    const brand = String(data.brand ?? current.brand).trim();
    const category = String(data.category ?? current.category).trim();
    const gender = String(data.gender ?? current.gender);
    const categorySlug = String(
      data.categorySlug ?? current.categorySlug ?? slugify(category),
    );
    const nextIsActive =
      data.isActive === undefined ? undefined : Boolean(data.isActive);
    const nextStatus =
      data.status === undefined ? undefined : String(data.status);

    await tx.brand.upsert({
      where: { name: brand },
      create: { name: brand, slug: slugify(brand) },
      update: {},
    });
    await tx.category.upsert({
      where: { slug_gender: { slug: categorySlug, gender } },
      create: { name: category, slug: categorySlug, gender },
      update: {},
    });

    if (
      nextIsActive === true ||
      nextStatus === "active" ||
      (nextIsActive === undefined && current.isActive) ||
      (nextStatus === undefined && current.status === "active")
    ) {
      const imageCount = images
        ? images.length
        : await tx.productImage.count({ where: { productId: documentId } });
      if (imageCount === 0) {
        throw new Error("A product needs at least one image before activation");
      }
    }

    await tx.product.update({
      where: { id: documentId },
      data: {
        ...(data.title !== undefined && {
          title: String(data.title),
        }),

        ...(data.brand !== undefined && {
          brand,
        }),

        ...(data.slug !== undefined && {
          slug: String(data.slug),
        }),

        ...(data.category !== undefined && {
          category,
        }),

        ...(data.categorySlug !== undefined && {
          categorySlug,
        }),

        ...(data.gender !== undefined && {
          gender,
        }),

        ...(data.price !== undefined && {
          price: Number(data.price),
        }),

        ...(data.retailPrice !== undefined && {
          retailPrice:
            data.retailPrice === null ? null : Number(data.retailPrice),
        }),

        ...(data.condition !== undefined && {
          condition: String(data.condition),
        }),

        ...(data.size !== undefined && {
          size: String(data.size),
        }),

        ...(data.chest !== undefined && {
          chest: data.chest ? String(data.chest) : null,
        }),

        ...(data.waist !== undefined && {
          waist: data.waist ? String(data.waist) : null,
        }),

        ...(data.length !== undefined && {
          length: data.length ? String(data.length) : null,
        }),

        ...(data.inseam !== undefined && {
          inseam: data.inseam ? String(data.inseam) : null,
        }),

        ...(data.color !== undefined && {
          color: data.color ? String(data.color) : null,
        }),

        ...(data.material !== undefined && {
          material: String(data.material),
        }),

        ...(data.description !== undefined && {
          description: data.description ? String(data.description) : null,
        }),

        ...(data.shippingInfo !== undefined && {
          shippingInfo: data.shippingInfo ? String(data.shippingInfo) : null,
        }),

        ...(data.isActive !== undefined && {
          isActive: Boolean(data.isActive),
        }),

        ...(data.status !== undefined && {
          status: String(data.status),
        }),
      },
    });

    if (images) {
      const existing = await tx.productImage.findMany({
        where: { productId: documentId },
      });
      const existingByKey = new Map(
        existing.map((image) => [image.url, image]),
      );

      for (const [position, key] of images.entries()) {
        const retained = existingByKey.get(key);
        if (retained) {
          await tx.productImage.update({
            where: { id: retained.id },
            data: { position },
          });
        } else {
          await tx.productImage.create({
            data: { productId: documentId, url: key, position },
          });
        }
      }

      await tx.productImage.deleteMany({
        where: {
          productId: documentId,
          ...(images.length > 0 ? { url: { notIn: images } } : {}),
        },
      });
    }
  });
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
