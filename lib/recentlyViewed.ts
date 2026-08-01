const STORAGE_KEY = "thriftx-recently-viewed";
const MAX_ITEMS = 20;

export interface RecentlyViewedProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  createdAt: number;
}

export function getRecentlyViewedProducts(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedProduct(
  product: Omit<RecentlyViewedProduct, "createdAt">,
) {
  if (typeof window === "undefined") return;

  const nextItems = [
    {
      ...product,
      createdAt: Date.now(),
    },
    ...getRecentlyViewedProducts().filter((item) => item.slug !== product.slug),
  ].slice(0, MAX_ITEMS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  } catch {
    // Ignore storage errors and keep the app resilient.
  }
}

export function clearRecentlyViewedProducts() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
