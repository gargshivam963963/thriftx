import { NextResponse } from "next/server";
import { getCartProductsServer } from "@/lib/services/cartProducts.server";

/**
 * GET /api/shop/cart-products
 *
 * Returns the current user's cart items enriched with product data.
 *
 * Production architecture:
 *   Client → Route Handler → Repository Layer → Prisma → PostgreSQL
 *
 * This route runs entirely on the server, so cart/checkout client components
 * never bundle the Prisma / pg (Postgres) stack. Product reads flow through
 * the repository layer (productRepository → prisma).
 */
export async function GET() {
  try {
    const products = await getCartProductsServer();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[cart-products] Failed to load cart products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load cart products" },
      { status: 500 },
    );
  }
}
