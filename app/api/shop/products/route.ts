import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/services/products";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const gender = searchParams.get("gender") || undefined;
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const size = searchParams.get("size") || undefined;
    const price = searchParams.get("price") || undefined;
    const sort =
      (searchParams.get("sort") as
        | "newest"
        | "price-low"
        | "price-high"
        | "name") || "newest";
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const measurement = searchParams.get("measurement") || undefined;

    const products = await getProducts({
      gender,
      category,
      brand: brand ? [brand] : undefined,
      size: size ? [size] : undefined,
      price,
      sort,
      limit,
      offset,
    });

    // Server-side measurement filter (since it's not a DB field)
    let filteredProducts = products;
    if (measurement) {
      const match = measurement.match(
        /^(chest|waist|length|inseam)-(\d+)(?:-plus)?$/,
      );
      if (match) {
        const type = match[1] as "chest" | "waist" | "length" | "inseam";
        const value = parseInt(match[2], 10);
        const isPlus = measurement.endsWith("-plus");
        filteredProducts = products.filter((p) => {
          const fieldValue = p[type];
          if (!fieldValue) return false;
          const numVal = parseInt(
            fieldValue.toString().replace(/[^\d]/g, ""),
            10,
          );
          if (isNaN(numVal)) return false;
          if (isPlus) return numVal >= value;
          return Math.abs(numVal - value) <= 2;
        });
      }
    }

    // Server-side search filter
    if (search) {
      const q = search.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      offset,
      limit,
      hasMore: filteredProducts.length === limit,
    });
  } catch (error) {
    console.error("Error fetching shop products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
