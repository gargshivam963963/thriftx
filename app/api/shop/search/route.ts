import { NextRequest, NextResponse } from "next/server";
import { searchProductsServer } from "@/lib/services/searchService.server";

/**
 * GET /api/shop/search?q=...&limit=...
 *
 * Returns products matching the search query.
 *
 * Production architecture:
 *   Client → Route Handler → Repository Layer → Prisma → PostgreSQL
 *
 * This route runs entirely on the server, so client components (e.g.
 * GlobalSearch) never bundle the Prisma / pg (Postgres) stack. Product search
 * flows through the repository layer (productRepository → prisma).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "12", 10) || 12, 1),
      48,
    );

    if (!q) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await searchProductsServer(q, limit);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[shop/search] Failed to search products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search products" },
      { status: 500 },
    );
  }
}
