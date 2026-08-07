import ProductGallerySkeleton from "@/components/product/ProductGallerySkeleton";
import ProductInfoSkeleton from "@/components/product/ProductInfoSkeleton";

/**
 * Product detail loading boundary — skeleton layout matching the
 * final page structure to prevent layout shift. Never a blank page.
 */
export default function ProductDetailLoading() {
    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb skeleton */}
            <div className="mb-8 flex items-center gap-2">
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <span className="text-muted-foreground">/</span>
                <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                <span className="text-muted-foreground">/</span>
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.25fr_500px] xl:items-start">
                {/* Left: gallery */}
                <div className="space-y-8">
                    <ProductGallerySkeleton />
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 animate-pulse rounded-xl bg-muted"
                            />
                        ))}
                    </div>
                </div>

                {/* Right: info */}
                <div className="xl:sticky xl:top-24">
                    <ProductInfoSkeleton />
                </div>
            </div>

            {/* Below the fold */}
            <div className="mt-10 space-y-6">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-40 animate-pulse rounded-2xl bg-muted"
                    />
                ))}
            </div>
        </div>
    );
}
