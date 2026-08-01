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
        <section className="rounded-[28px] border border-neutral-200 bg-white/90 p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">
                        Similar Products
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                        Carefully matched to this style
                    </h3>
                </div>
                <Link href="/shop" className="text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
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
