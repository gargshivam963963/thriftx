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
): Promise<boolean> {
  try {
    const images = Array.isArray(data.images)
      ? data.images.filter(
          (image): image is string => typeof image === "string",
        )
      : [];

    await prisma!.product.create({
      data: {
        title: String(data.title ?? ""),
        brand: String(data.brand ?? ""),
        slug: String(data.slug ?? ""),

        category: String(data.category ?? ""),
        categorySlug: String(data.categorySlug ?? data.category ?? ""),
        gender: String(data.gender ?? "Unisex"),

        price: Number(data.price ?? 0),
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
        material: String(data.material ?? ""),

        description: data.description ? String(data.description) : null,

        shippingInfo: data.shippingInfo ? String(data.shippingInfo) : null,

        isActive: true,
        status: "active",

        images: {
          create: images.map((url, index) => ({
            url,
            position: index,
          })),
        },
      },
    });

    return true;
  } catch (error) {
    console.error("createProduct error:", error);
    return false;
  }
}

export async function updateProduct(
  documentId: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const images = Array.isArray(data.images)
      ? data.images.filter(
          (image): image is string => typeof image === "string",
        )
      : null;

    await prisma!.product.update({
      where: {
        id: documentId,
      },
      data: {
        ...(data.title !== undefined && {
          title: String(data.title),
        }),

        ...(data.brand !== undefined && {
          brand: String(data.brand),
        }),

        ...(data.slug !== undefined && {
          slug: String(data.slug),
        }),

        ...(data.category !== undefined && {
          category: String(data.category),
        }),

        ...(data.categorySlug !== undefined && {
          categorySlug: String(data.categorySlug),
        }),

        ...(data.gender !== undefined && {
          gender: String(data.gender),
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
      await prisma!.productImage.deleteMany({
        where: {
          productId: documentId,
        },
      });

      if (images.length > 0) {
        await prisma!.productImage.createMany({
          data: images.map((url, index) => ({
            productId: documentId,
            url,
            position: index,
          })),
        });
      }
    }

    return true;
  } catch (error) {
    console.error("updateProduct error:", error);
    return false;
  }
}
