import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export interface WishlistProduct {
  wishlistId: string;
  productId: string;
  title: string;
  brand: string;
  price: number;
  primaryImage: string;
  size: string;
  condition: string;
  category: string;
  slug: string;
  addedAt: string;
}

/**
 * Fetch all wishlisted products with full product details
 * for the current user.
 *
 * Better Auth provides the identity; wishlist and product data come from
 * Prisma/Neon.
 */
export async function getWishlistProducts(
  userId: string,
): Promise<WishlistProduct[]> {
  if (!isDatabaseConfigured) {
    return [];
  }

  try {
    const wishlistItems = await prisma!.wishlist.findMany({
      where: {
        userId,
        product: {
          isActive: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    return wishlistItems.map((item) => {
      const product = item.product;

      return {
        wishlistId: item.id,
        productId: product.id,

        title: product.title,
        brand: product.brand,
        price: product.price,

        primaryImage: product.images[0]?.url ?? "",

        size: product.size,
        condition: product.condition,
        category: product.category,
        slug: product.slug,

        addedAt: item.createdAt.toISOString(),
      };
    });
  } catch (error) {
    console.error("getWishlistProducts error:", error);
    return [];
  }
}
