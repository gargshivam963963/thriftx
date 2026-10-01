import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createUploadUrl } from "@/lib/storage/r2Upload";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const authError = await adminAuthErrorResponse();

  if (authError) {
    return authError;
  }

  try {
    const contentLength = request.headers.get("content-length");

    if (contentLength !== null) {
      const parsedLength = Number(contentLength);

      if (
        !Number.isSafeInteger(parsedLength) ||
        parsedLength < 0 ||
        parsedLength > MAX_BODY_BYTES
      ) {
        return errorResponse("Invalid or oversized request body", 413);
      }
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return errorResponse("Request body is too large", 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid request body", 400);
    }

    const { productId, contentType, position } = body as {
      productId?: unknown;
      contentType?: unknown;
      position?: unknown;
    };

    if (
      typeof productId !== "string" ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(productId) ||
      typeof contentType !== "string" ||
      !Object.prototype.hasOwnProperty.call(allowedTypes, contentType) ||
      typeof position !== "number" ||
      !Number.isSafeInteger(position) ||
      position < 0 ||
      position >= 20
    ) {
      return errorResponse(
        "A valid productId, image type, and position are required",
        400,
      );
    }

    if (!isDatabaseConfigured || !prisma) {
      return errorResponse("Storage service is unavailable", 503);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const extension = allowedTypes[contentType];

    const key = `products/${product.id}/image-${position + 1}-${randomUUID()}.${extension}`;

    const uploadUrl = await createUploadUrl(key, contentType);

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        key,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    console.error("[storage-upload-url] Failed to create upload URL");

    return errorResponse("Unable to create upload URL", 500);
  }
}
