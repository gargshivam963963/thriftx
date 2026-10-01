import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import {
  addToCart,
  clearCart,
  removeCartItem,
  updateCartQuantity,
} from "@/lib/services/cart.server";

async function getUserOrResponse() {
  try {
    return { user: await requireUser() };
  } catch {
    return {
      response: NextResponse.json(
        { success: false, message: "Please sign in to update your cart" },
        { status: 401 },
      ),
    };
  }
}

export async function POST(request: NextRequest) {
  const auth = await getUserOrResponse();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const productId = body?.productId;
    const quantity = body?.quantity ?? 1;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid product or quantity" },
        { status: 400 },
      );
    }

    await addToCart(auth.user.id, productId, quantity);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to add item to cart" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getUserOrResponse();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const cartId = body?.cartId;
    const quantity = body?.quantity;

    if (
      typeof cartId !== "string" ||
      !cartId ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cart item or quantity" },
        { status: 400 },
      );
    }

    await updateCartQuantity(auth.user.id, cartId, quantity);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update cart item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getUserOrResponse();
  if ("response" in auth) return auth.response;

  try {
    const cartId = request.nextUrl.searchParams.get("cartId");
    if (cartId) {
      await removeCartItem(auth.user.id, cartId);
    } else {
      await clearCart(auth.user.id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to remove cart item" },
      { status: 500 },
    );
  }
}
