export interface CartMutationResponse {
  success: true;
  message?: string;
  cartId?: string;
}

export class CartRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "CartRequestError";
    this.status = status;
    this.code = code;
  }
}

type CartMethod = "POST" | "PATCH" | "DELETE";

interface CartApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
  cartId?: string;
}

async function cartRequest(
  method: CartMethod,
  body?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<CartMutationResponse> {
  let response: Response;

  try {
    response = await fetch("/api/cart", {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "same-origin",
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new CartRequestError(
      "Unable to connect to your cart. Please try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  let result: CartApiResponse;

  try {
    result = (await response.json()) as CartApiResponse;
  } catch {
    throw new CartRequestError(
      "The cart service returned an invalid response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok || result.success !== true) {
    throw new CartRequestError(
      result.message ||
        result.error ||
        "Your cart could not be updated. Please try again.",
      response.status,
      result.code,
    );
  }

  return {
    success: true,
    ...(result.message ? { message: result.message } : {}),
    ...(result.cartId ? { cartId: result.cartId } : {}),
  };
}

/**
 * Adds a unique THRIFTX product.
 * Quantity is deliberately restricted to one.
 */
export async function addToCart(
  productId: string,
  quantity = 1,
  signal?: AbortSignal,
): Promise<CartMutationResponse> {
  if (!productId.trim()) {
    throw new CartRequestError(
      "A valid product is required.",
      400,
      "INVALID_PRODUCT_ID",
    );
  }

  if (quantity !== 1) {
    throw new CartRequestError(
      "Only one piece of each THRIFTX product is available.",
      400,
      "INVALID_QUANTITY",
    );
  }

  return cartRequest(
    "POST",
    {
      productId: productId.trim(),
      quantity: 1,
    },
    signal,
  );
}

/**
 * Removes a cart entry by its server-issued cart ID.
 */

/**
 * Removes only the selected cart entry by its server-issued cart ID.
 */

export async function removeCartItem(
  id: string,
  signal?: AbortSignal,
): Promise<CartMutationResponse> {
  const cartId = id.trim();

  if (!cartId) {
    throw new CartRequestError(
      "A valid cart item is required.",
      400,
      "INVALID_CART_ID",
    );
  }

  let response: Response;

  try {
    response = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new CartRequestError(
      "Unable to connect to your cart. Please try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  let result: CartApiResponse;

  try {
    result = (await response.json()) as CartApiResponse;
  } catch {
    throw new CartRequestError(
      "The cart service returned an invalid response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok || result.success !== true) {
    throw new CartRequestError(
      result.message || result.error || "Unable to remove this item.",
      response.status,
      result.code,
    );
  }

  return {
    success: true,
    ...(result.message ? { message: result.message } : {}),
  };
}

/**
 * Quantity changes are not supported for one-of-a-kind products.
 * A quantity of zero removes the item.
 */
export async function updateCartQuantity(
  id: string,
  quantity: number,
  signal?: AbortSignal,
): Promise<CartMutationResponse> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new CartRequestError(
      "Invalid cart quantity.",
      400,
      "INVALID_QUANTITY",
    );
  }

  if (quantity === 0) {
    return removeCartItem(id, signal);
  }

  if (quantity !== 1) {
    throw new CartRequestError(
      "Only one piece of each THRIFTX product is available.",
      400,
      "INVALID_QUANTITY",
    );
  }

  return cartRequest(
    "PATCH",
    {
      cartId: id,
      quantity: 1,
    },
    signal,
  );
}

/**
 * Clears the current server-side cart.
 */
export async function clearCart(
  signal?: AbortSignal,
): Promise<CartMutationResponse> {
  return cartRequest("DELETE", undefined, signal);
}
