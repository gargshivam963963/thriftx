import { NextResponse } from "next/server";
import { getProducts } from "@/lib/services/products";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || undefined;
    const subCategory = url.searchParams.get("subCategory") || undefined;

    const products = await getProducts(category, subCategory, 100);
    const sample = products
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: p.title }));
    return NextResponse.json(
      { count: products.length, sample },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
