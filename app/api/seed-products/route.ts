import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/services/products";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function POST(request: Request) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

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
