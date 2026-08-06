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
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6">
                <p className="text-badge font-semibold uppercase tracking-widest text-muted-foreground">
                    Complete The Look
                </p>
                <h3 className="mt-1 text-heading-4 font-semibold text-foreground">
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

            <div className="mt-5 text-body text-muted-foreground">
                Recommended styles: {recommendations.join(" • ")}
            </div>
        </section>
    );
}
