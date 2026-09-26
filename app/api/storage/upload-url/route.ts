import { NextRequest, NextResponse } from "next/server";
import { createUploadUrl } from "@/lib/storage/r2Upload";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(request: NextRequest) {
  try {
    const { contentType } = await request.json();

    if (!contentType || !allowedTypes.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 400 },
      );
    }

    const extension = contentType.split("/")[1];
    const key = `products/${crypto.randomUUID()}.${extension}`;

    const uploadUrl = await createUploadUrl(key, contentType);

    return NextResponse.json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);

    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
