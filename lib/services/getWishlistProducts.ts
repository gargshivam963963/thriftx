import "server-only";

import {
  documentStore,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import { prisma } from "@/lib/prisma";
import { createProductImageUrl } from "@/lib/storage/r2Download";

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

export async function getWishlistProducts(
  userId: string,
): Promise<WishlistProduct[]> {
  if (!isDocumentStoreConfigured || !prisma) {
    throw new Error("Neon database is not configured");
  }

  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "wishlists",
    [
      DocumentQuery.equal("userId", userId),
      DocumentQuery.orderDesc("$createdAt"),
      DocumentQuery.limit(100),
    ],
  );

  const wishlistItems = documents.flatMap((document) => {
    const productId = document.productId;
    if (typeof productId !== "string" || !productId) return [];

    return [{
      wishlistId: document.$id,
      productId,
      addedAt: document.$createdAt,
    }];
  });

  if (!wishlistItems.length) return [];

  const products = await prisma.product.findMany({
    where: {
      id: { in: [...new Set(wishlistItems.map((item) => item.productId))] },
      isActive: true,
      status: "active",
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  return Promise.all(
    wishlistItems.flatMap((item) => {
      const product = productsById.get(item.productId);
      if (!product) return [];

      return [
        createProductImageUrl(product.images[0]?.url ?? "").then(
          (primaryImage) => ({
            wishlistId: item.wishlistId,
            productId: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            primaryImage,
            size: product.size,
            condition: product.condition,
            category: product.category,
            slug: product.slug,
            addedAt: item.addedAt,
          }),
        ),
      ];
    }),
  );
}
