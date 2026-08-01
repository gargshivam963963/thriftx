import Link from "next/link";
import type { Product } from "@/lib/services/products";
import { getProducts } from "@/lib/services/products";
import ProductCardGrid from "@/components/shop/ProductCardGrid";

const COMPLETE_THE_LOOK = {
    jeans: ["Jeans", "Sneakers", "Cap", "Shirt"],
    hoodie: ["Hoodie", "Sneakers", "Jeans", "Cap"],
    jacket: ["Jacket", "Sneakers", "Shirt", "Bag"],
    shirt: ["Shirt", "Jeans", "Sneakers", "Watch"],
};

function pickRecommendations(product: Product) {
    const normalized = (product.category || "").toLowerCase();
    if (normalized.includes("hoodie")) return COMPLETE_THE_LOOK.hoodie;
    if (normalized.includes("jacket")) return COMPLETE_THE_LOOK.jacket;
    if (normalized.includes("shirt")) return COMPLETE_THE_LOOK.shirt;
    return COMPLETE_THE_LOOK.jeans;
}

export default async function CompleteTheLookSection({ product }: { product: Product }) {
    const recommendations = pickRecommendations(product);
    const query = recommendations[0];
    const relatedProducts = await getProducts({ limit: 4, sort: "newest" });
    const filtered = relatedProducts.filter((item) => item.slug !== product.slug && item.category?.toLowerCase().includes(query.toLowerCase()));

    if (!filtered.length) {
        return null;
    }

    return (
        <section className="rounded-[28px] border border-neutral-200 bg-white/90 p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
            <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">
                    Complete The Look
                </p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    Pair this with pieces that feel intentional
                </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.map((item) => (
                    <ProductCardGrid
                        key={item.id}
                        id={item.id}
                        slug={item.slug}
                        brand={item.brand}
                        title={item.title}
                        price={item.price}
                        retailPrice={item.retailPrice}
                        image={item.primaryImage || item.images?.[0] || ""}
                        category={item.category}
                        chest={item.chest}
                        waist={item.waist}
                        length={item.length}
                    />
                ))}
            </div>

            <div className="mt-5 text-sm text-neutral-600 dark:text-neutral-300">
                Recommended styles: {recommendations.join(" • ")}
            </div>
        </section>
    );
}
