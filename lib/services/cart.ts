import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get the currently authenticated Better Auth user.
 *
 * This function is server-only.
 */
async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

/**
 * Add a product to the current user's cart.
 *
 * If the product already exists in the cart,
 * its quantity is increased.
 */
export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<CartItem> {
  const userId = await getCurrentUserId();

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  // Make sure the product actually exists.
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      isActive: true,
      status: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isActive || product.status !== "active") {
    throw new Error("Product is not available");
  }

  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    create: {
      userId,
      productId,
      quantity,
    },

    update: {
      quantity: {
        increment: quantity,
      },
    },
  });

  return cartItem;
}

/**
 * Get all cart items belonging to the current user.
 */
export async function getCartItems(): Promise<CartItem[]> {
  const userId = await getCurrentUserId();

  const items = await prisma.cartItem.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

/**
 * Remove one cart item.
 *
 * The userId condition is important:
 * a user must never be able to delete another user's cart item.
 */
export async function removeCartItem(id: string) {
  const userId = await getCurrentUserId();

  if (!id) {
    throw new Error("Cart item ID is required");
  }

  return prisma.cartItem.deleteMany({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Update the quantity of a cart item.
 *
 * Quantity <= 0 removes the item.
 */
export async function updateCartQuantity(id: string, quantity: number) {
  const userId = await getCurrentUserId();

  if (!id) {
    throw new Error("Cart item ID is required");
  }

  if (!Number.isInteger(quantity)) {
    throw new Error("Quantity must be an integer");
  }

  if (quantity <= 0) {
    return prisma.cartItem.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  return prisma.cartItem.updateMany({
    where: {
      id,
      userId,
    },

    data: {
      quantity,
    },
  });
}

/**
 * Remove every cart item belonging to the current user.
 */
export async function clearCart() {
  const userId = await getCurrentUserId();

  return prisma.cartItem.deleteMany({
    where: {
      userId,
    },
  });
}
