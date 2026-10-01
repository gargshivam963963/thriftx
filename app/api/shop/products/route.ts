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
    const color = searchParams.get("color") || undefined;
    const material = searchParams.get("material") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const search = searchParams.get("search") || undefined;
    const measurement = searchParams.get("measurement") || undefined;

    const sort =
      (searchParams.get("sort") as
        | "newest"
        | "price-low"
        | "price-high"
        | "name"
        | "popular") || "newest";

    const MAX_LIMIT = 48;
    const parsedLimit = Number.parseInt(
      searchParams.get("limit") || "12",
      10,
    );
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(1, parsedLimit), MAX_LIMIT)
      : 12;

    const parsedOffset = Number.parseInt(
      searchParams.get("offset") || "0",
      10,
    );
    const offset = Number.isFinite(parsedOffset)
      ? Math.max(0, parsedOffset)
      : 0;

    // Fetch one extra row so the client can know whether another page exists.
    const products = await getProducts({
      gender,
      category,
      brand: brand ? [brand] : undefined,
      size: size ? [size] : undefined,
      price,
      color,
      material,
      condition: condition ? [condition] : undefined,
      search,
      sort,
      limit: limit + 1,
      offset,
    });

    let filteredProducts = products;

    if (measurement) {
      const match = measurement.match(
        /^(chest|waist|length|inseam)-(\d+)(?:-plus)?$/,
      );

      if (match) {
        const type = match[1] as
          | "chest"
          | "waist"
          | "length"
          | "inseam";
        const value = Number.parseInt(match[2], 10);
        const isPlus = measurement.endsWith("-plus");

        filteredProducts = products.filter((product) => {
          const fieldValue = product[type];
          if (!fieldValue) return false;

          const numericValue = Number.parseInt(
            String(fieldValue).replace(/[^\d]/g, ""),
            10,
          );

          if (Number.isNaN(numericValue)) return false;
          if (isPlus) return numericValue >= value;
          return Math.abs(numericValue - value) <= 2;
        });
      }
    }

    const hasMore = filteredProducts.length > limit;
    const pageProducts = filteredProducts.slice(0, limit);

    return NextResponse.json({
      success: true,
      products: pageProducts,
      offset,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching shop products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}
