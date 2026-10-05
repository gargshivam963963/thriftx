import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { seedProducts } from "@/lib/services/products";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authError = await adminAuthErrorResponse();

  if (authError) {
    return authError;
  }

  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");

    if (contentLength > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Request body is too large" },
        { status: 413 },
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Request body is too large" },
        { status: 413 },
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Request body must be an array" },
        { status: 400 },
      );
    }

    if (body.length === 0 || body.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Product batch must contain between 1 and 100 items",
        },
        { status: 400 },
      );
    }

    const result = await seedProducts(body);

    revalidateTag("products");

    return NextResponse.json(
      {
        success: true,
        result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    console.error("[seed-products] Product seeding failed");

    return NextResponse.json(
      {
        success: false,
        error: "Unable to seed products",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }
}
