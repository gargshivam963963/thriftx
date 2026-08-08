import type { Product } from "./products";

export interface CartProduct extends Product {
  cartId: string;
  quantity: number;
}

/**
 * Client-safe `getCartProducts`.
 *
 * Used by "use client" pages (cart, checkout). It only imports the `Product`
 * type (erased at build time) and fetches product data via the
 * `/api/shop/cart-products` route handler. It does NOT import `./products`
 * at runtime, so the Prisma / pg (Postgres) stack is never bundled for the
 * browser.
 *
 * Product reads happen server-side through:
 *   Route Handler → Repository Layer → Prisma → PostgreSQL
 *
 * Returns an empty array on any failure so the UI can render a graceful
 * empty/loading state instead of crashing.
 */
export async function getCartProducts(): Promise<CartProduct[]> {
  try {
    const res = await fetch("/api/shop/cart-products", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[cartProducts] route handler returned", res.status);
      return [];
    }

    const data = (await res.json()) as {
      success: boolean;
      products?: CartProduct[];
    };

    if (!data.success || !Array.isArray(data.products)) {
      return [];
    }

    return data.products;
  } catch (error) {
    console.error("[cartProducts] failed to fetch cart products:", error);
    return [];
  }
}
