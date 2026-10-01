import { NextRequest, NextResponse } from "next/server";
import { getWishlistProducts } from "@/lib/services/getWishlistProducts";
import { requireUser } from "@/lib/auth-guard";
import {
  getWishlistedProductIds,
  toggleWishlist,
} from "@/lib/services/wishlist.server";

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
    if (req.nextUrl.searchParams.get("ids") === "1") {
      const productIds = await getWishlistedProductIds(user.id);
      return NextResponse.json({ success: true, productIds });
    }

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

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const productId = body?.productId;

    if (typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid product" },
        { status: 400 },
      );
    }

    const wishlisted = await toggleWishlist(user.id, productId);
    return NextResponse.json({ success: true, wishlisted });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wishlist" },
      { status: 500 },
    );
  }
}
