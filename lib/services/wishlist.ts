export async function getWishlistedProductIds(): Promise<string[]> {
  const response = await fetch("/api/wishlist?ids=1", { cache: "no-store" });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    productIds?: string[];
  };

  if (!response.ok || !result.success || !Array.isArray(result.productIds)) {
    throw new Error(result.message || "Failed to load wishlist");
  }

  return result.productIds;
}

export async function toggleWishlist(productId: string) {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    wishlisted?: boolean;
  };

  if (!response.ok || !result.success || typeof result.wishlisted !== "boolean") {
    throw new Error(result.message || "Wishlist request failed");
  }

  return result.wishlisted;
}
