import Link from "next/link";
import type { Product } from "@/lib/services/products";
import { getSimilarProducts } from "@/lib/services/products";
import ProductCardGrid from "@/components/shop/ProductCardGrid";

export default async function SimilarProductsSection({ product }: { product: Product }) {
    const similarProducts = await getSimilarProducts(product, 6);

    if (!similarProducts.length) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-badge font-semibold uppercase tracking-widest text-muted-foreground">
                        Similar Products
                    </p>
                    <h3 className="mt-1 text-heading-4 font-semibold text-foreground">
                        Carefully matched to this style
                    </h3>
                </div>
                <Link href="/shop" className="text-body-sm font-semibold text-muted-foreground transition hover:text-foreground">
                    Browse all similar pieces
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {similarProducts.map((item) => (
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
        </section>
    );
}
