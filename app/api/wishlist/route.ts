import { NextRequest, NextResponse } from "next/server";
import { getWishlistProducts } from "@/lib/services/getWishlistProducts";
import { requireUser } from "@/lib/auth-guard";

/**
 * GET /api/wishlist
 * Returns the current user's wishlist products (server-side).
 *
 * Wishlist and product data come from Prisma/Neon. Better Auth provides the
 * current user id, keeping database access out of the client bundle.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const items = await getWishlistProducts(user.id);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("[api/wishlist]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load wishlist" },
      { status: 500 },
    );
  }
}
