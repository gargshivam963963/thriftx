import { createProductImageUrl } from "@/lib/storage/r2Download";
import { NextRequest, NextResponse } from "next/server";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/lib/services/adminProductService";

/**
 * Admin product CRUD API — server-only.
 *
 * Client admin pages call this route handler, which in turn uses the
 * server-only AdminProductService (Prisma/Neon). This keeps `pg`/Prisma out of
 * the client bundle and keeps the admin UI decoupled from the data layer.
 */

export async function GET() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const products = await getAllProducts();

    const productsWithImageUrls = await Promise.all(
      products.map(async (product) => {
        const imageKeys = Array.isArray(product.imageKeys)
          ? product.imageKeys.filter(Boolean)
          : [];

        const imageUrls = await Promise.all(
          imageKeys.map((key) => createProductImageUrl(key)),
        );

        return {
          ...product,
          primaryImage: imageUrls[0] || "",
          images: imageUrls,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      products: productsWithImageUrls,
    });
  } catch (error) {
    console.error("[api/admin/products] GET failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { productId } = await createProduct(body ?? {});
    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (error) {
    console.error("[api/admin/products] POST failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, data } = body ?? {};
    if (!id || !data) {
      return NextResponse.json(
        { success: false, message: "id and data are required" },
        { status: 400 },
      );
    }
    await updateProduct(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/products] PUT failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update product",
      },
      {
        status:
          error instanceof Error && error.message === "Product not found"
            ? 404
            : 400,
      },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, isActive } = body ?? {};
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "id and isActive are required" },
        { status: 400 },
      );
    }
    const ok = await toggleProductStatus(id, isActive);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[api/admin/products] PATCH failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product status" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 },
      );
    }
    const ok = await deleteProduct(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[api/admin/products] DELETE failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
