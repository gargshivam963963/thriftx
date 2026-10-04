import type { Product } from "./products";

export interface CartProduct extends Product {
  cartId: string;
  quantity: 1;
}

interface CartProductsResponse {
  success?: boolean;
  products?: CartProduct[];
  message?: string;
  error?: string;
}

export class CartProductsError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "CartProductsError";
    this.status = status;
    this.code = code;
  }
}

function isCartProduct(value: unknown): value is CartProduct {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as Partial<CartProduct>;

  return (
    typeof product.id === "string" &&
    product.id.length > 0 &&
    typeof product.cartId === "string" &&
    product.cartId.length > 0 &&
    product.quantity === 1 &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0
  );
}

async function readResponse(response: Response): Promise<CartProductsResponse> {
  try {
    return (await response.json()) as CartProductsResponse;
  } catch {
    throw new CartProductsError(
      "The cart service returned an invalid response. Please try again.",
      response.status,
      "INVALID_RESPONSE",
    );
  }
}

/**
 * Retrieves the current server-authoritative cart.
 *
 * Important:
 * - A failed request throws an error; it never becomes an empty cart.
 * - The API response is not trusted until its basic shape is validated.
 * - Quantity is fixed at 1 because THRIFTX products are one-of-a-kind.
 * - The server remains authoritative for cart ownership and availability.
 */
export async function getCartProducts(
  signal?: AbortSignal,
): Promise<CartProduct[]> {
  let response: Response;
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10_000);

  if (signal?.aborted) {
    clearTimeout(timeoutId);
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
  signal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    response = await fetch("/api/shop/cart-products", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });
  } catch (error) {
    signal?.removeEventListener("abort", forwardAbort);
    if (signal?.aborted || (error instanceof Error && error.name === "AbortError" && !timedOut)) {
      throw error;
    }

    throw new CartProductsError(
      timedOut
        ? "Your cart took too long to load. Please retry."
        : "Unable to connect to your cart. Check your connection and try again.",
      0,
      timedOut ? "TIMEOUT" : "NETWORK_ERROR",
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", forwardAbort);
  }

  const data = await readResponse(response);

  if (!response.ok || !data.success) {
    throw new CartProductsError(
      data.message ||
        data.error ||
        "We couldn't load your cart. Please try again.",
      response.status,
      "CART_REQUEST_FAILED",
    );
  }

  if (!Array.isArray(data.products)) {
    throw new CartProductsError(
      "The cart service returned unexpected data. Please try again.",
      response.status,
      "INVALID_CART_DATA",
    );
  }

  if (!data.products.every(isCartProduct)) {
    throw new CartProductsError(
      "Some cart items could not be verified. Please refresh your cart.",
      response.status,
      "INVALID_CART_ITEM",
    );
  }

  const uniqueProducts = new Map<string, CartProduct>();

  for (const product of data.products) {
    if (!uniqueProducts.has(product.id)) {
      uniqueProducts.set(product.id, {
        ...product,
        quantity: 1,
      });
    }
  }

  return Array.from(uniqueProducts.values());
}
