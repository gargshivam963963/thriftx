import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { getCartProductsForUser } from "@/lib/services/cartProducts.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export async function GET() {
  let user;

  try {
    user = await requireUser();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in to view your cart.",
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
        headers,
      },
    );
  }

  try {
    const products = await getCartProductsForUser(user.id);

    return NextResponse.json(
      {
        success: true,
        products,
      },
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    console.error("[cart-products] Failed to load cart:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your cart. Please try again.",
        error: "CART_LOAD_FAILED",
      },
      {
        status: 500,
        headers,
      },
    );
  }
}
