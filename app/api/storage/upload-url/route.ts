import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createUploadUrl } from "@/lib/storage/r2Upload";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { productId, contentType, position } = await request.json();

    if (
      typeof productId !== "string" ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(productId) ||
      typeof contentType !== "string" ||
      !allowedTypes[contentType] ||
      !Number.isInteger(position) ||
      position < 0 ||
      position >= 20
    ) {
      return NextResponse.json(
        { error: "A valid productId, image type, and position are required" },
        { status: 400 },
      );
    }

    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        { error: "Database is not configured" },
        { status: 503 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const key = `products/${productId}/image-${position + 1}-${randomUUID()}.${allowedTypes[contentType]}`;

    const uploadUrl = await createUploadUrl(key, contentType);

    return NextResponse.json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create upload URL",
      },
      { status: 500 },
    );
  }
}
