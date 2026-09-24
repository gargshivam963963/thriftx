import { NextRequest, NextResponse } from "next/server";
import { getWishlistProducts } from "@/lib/services/getWishlistProducts";

/**
 * GET /api/wishlist
 * Returns the current user's wishlist products (server-side).
 *
 * Wishlist + Product data come from Prisma/Neon. Appwrite Auth temporarily
 * provides the current user id. This route keeps the DB access out of the
 * client bundle.
 */
export async function GET(req: NextRequest) {
  try {
    const items = await getWishlistProducts();

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
