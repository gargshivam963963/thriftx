async function cartRequest<T>(
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, string | number>,
): Promise<T> {
  const response = await fetch("/api/cart", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Cart request failed");
  }

  return result as T;
}

export async function addToCart(productId: string, quantity = 1) {
  return cartRequest("POST", { productId, quantity });
}

export async function removeCartItem(id: string) {
  const response = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to remove cart item");
  }
  return result;
}

export async function updateCartQuantity(id: string, quantity: number) {
  return cartRequest("PATCH", { cartId: id, quantity });
}

export async function clearCart() {
  return cartRequest("DELETE");
}
