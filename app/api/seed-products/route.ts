import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/services/products";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of products" },
        { status: 400 },
      );
    }

    const result = await seedProducts(body);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
