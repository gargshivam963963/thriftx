import { getCartItems, removeCartItem as removeFromCart } from "./cart.server";
import { getProductsByIds, Product } from "./products";
import { requireUser } from "@/lib/auth-guard";

export interface CartProduct extends Product {
  cartId: string;
  quantity: number;
}

/**
 * Server-side implementation of getCartProducts.
 *
 * Reads cart items and enriches
 * each with product data from the repository layer (ProductRepository → Prisma).
 *
 * NOTE: This file is server-only. It imports `./products` → `lib/prisma.ts` →
 * `pg`, so it must only be imported from Route Handlers / Server Components.
 * Client components must use the client-safe `getCartProducts()` from
 * `./cartProducts`, which fetches the `/api/shop/cart-products` route handler.
 */
export async function getCartProductsServer(): Promise<CartProduct[]> {
  const user = await requireUser();
  return getCartProductsForUser(user.id);
}

export async function getCartProductsForUser(
  userId: string,
): Promise<CartProduct[]> {
  const cartItems = await getCartItems(userId);

  if (!cartItems.length) {
    return [];
  }

  const products = await getProductsByIds(
    cartItems.map((item) => item.productId),
  );
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );
  const orphanedItems = cartItems.filter(
    (item) => !productsById.has(item.productId),
  );

  await Promise.allSettled(
    orphanedItems.map((item) => removeFromCart(userId, item.id)),
  );

  return cartItems.flatMap((item) => {
    const product = productsById.get(item.productId);
    return product
      ? [{ ...product, cartId: item.id, quantity: item.quantity }]
      : [];
  });
}
