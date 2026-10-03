import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import {
  addToCart,
  clearCart,
  removeCartItem,
  updateCartQuantity,
} from "@/lib/services/cart.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_BODY_SIZE = 8 * 1024;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Cookie",
    },
  });
}

async function getAuthenticatedUser() {
  try {
    return { user: await requireUser() };
  } catch {
    return {
      response: jsonResponse(
        {
          success: false,
          message: "Please sign in to update your cart",
          error: "UNAUTHORIZED",
        },
        401,
      ),
    };
  }
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > MAX_BODY_SIZE) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > MAX_BODY_SIZE) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("INVALID_JSON");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 200
  );
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && /not found/i.test(error.message);
}

function handleError(error: unknown, operation: string) {
  if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") {
    return jsonResponse(
      {
        success: false,
        message: "Request is too large",
        error: "REQUEST_TOO_LARGE",
      },
      413,
    );
  }

  if (error instanceof Error && error.message === "INVALID_JSON") {
    return jsonResponse(
      {
        success: false,
        message: "Invalid JSON request",
        error: "INVALID_JSON",
      },
      400,
    );
  }

  if (isNotFoundError(error)) {
    return jsonResponse(
      { success: false, message: "Cart item not found", error: "NOT_FOUND" },
      404,
    );
  }

  console.error(`[api/cart] ${operation} failed`, error);

  return jsonResponse(
    {
      success: false,
      message: "Unable to update your cart. Please try again.",
      error: "CART_OPERATION_FAILED",
    },
    500,
  );
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();

  if ("response" in auth) return auth.response;

  try {
    const body = await readJsonBody(request);

    if (!isRecord(body) || !isValidId(body.productId)) {
      return jsonResponse(
        {
          success: false,
          message: "A valid product is required",
          error: "INVALID_PRODUCT",
        },
        400,
      );
    }

    const quantity = body.quantity ?? 1;

    if (quantity !== 1) {
      return jsonResponse(
        {
          success: false,
          message: "This is a one-of-a-kind item. Quantity must be 1.",
          error: "INVALID_QUANTITY",
        },
        400,
      );
    }

    const item = await addToCart(auth.user.id, body.productId, 1);

    return jsonResponse({
      success: true,
      cartId: item.$id,
    });
  } catch (error) {
    return handleError(error, "POST");
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedUser();

  if ("response" in auth) return auth.response;

  try {
    const body = await readJsonBody(request);

    if (!isRecord(body) || !isValidId(body.cartId)) {
      return jsonResponse(
        {
          success: false,
          message: "A valid cart item is required",
          error: "INVALID_CART_ITEM",
        },
        400,
      );
    }

    if (body.quantity !== 1) {
      return jsonResponse(
        {
          success: false,
          message: "This is a one-of-a-kind item. Quantity must be 1.",
          error: "INVALID_QUANTITY",
        },
        400,
      );
    }

    await updateCartQuantity(auth.user.id, body.cartId, 1);

    return jsonResponse({ success: true });
  } catch (error) {
    return handleError(error, "PATCH");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedUser();

  if ("response" in auth) return auth.response;

  try {
    const cartId = request.nextUrl.searchParams.get("cartId");

    if (cartId !== null) {
      if (!isValidId(cartId)) {
        return jsonResponse(
          {
            success: false,
            message: "A valid cart item is required",
            error: "INVALID_CART_ITEM",
          },
          400,
        );
      }

      await removeCartItem(auth.user.id, cartId);
    } else {
      await clearCart(auth.user.id);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return handleError(error, "DELETE");
  }
}
