import { getCartItems, removeCartItem as removeFromCart } from "./cart";
import { getProductById, Product } from "./products";

export interface CartProduct extends Product {
  cartId: string;
  quantity: number;
}

/**
 * Server-side implementation of getCartProducts.
 *
 * Reads cart items (Appwrite cart — still in scope for Phase 1) and enriches
 * each with product data from the repository layer (ProductRepository → Prisma).
 *
 * NOTE: This file is server-only. It imports `./products` → `lib/prisma.ts` →
 * `pg`, so it must only be imported from Route Handlers / Server Components.
 * Client components must use the client-safe `getCartProducts()` from
 * `./cartProducts`, which fetches the `/api/shop/cart-products` route handler.
 */
export async function getCartProductsServer(): Promise<CartProduct[]> {
  const cartItems = await getCartItems();

  if (!cartItems.length) {
    return [];
  }

  const results = await Promise.allSettled(
    cartItems.map(async (item) => {
      try {
        const product = await getProductById(item.productId);

        if (!product) {
          // Product no longer exists in DB — clean up the orphaned cart item silently
          try {
            await removeFromCart(item.id);
          } catch {
            // Ignore cleanup errors
          }
          return null;
        }

        return {
          ...product,
          cartId: item.id,
          quantity: item.quantity,
        } satisfies CartProduct;
      } catch {
        // Product fetch failed — clean up orphaned cart item
        try {
          await removeFromCart(item.id);
        } catch {
          // Ignore cleanup errors
        }
        return null;
      }
    }),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<CartProduct | null> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .filter((product): product is CartProduct => product !== null);
}
