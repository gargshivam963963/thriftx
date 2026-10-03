"use client";

/**
 * ProductDetailSkeleton — premium loading state for the product detail page.
 * Mirrors the final layout (gallery left, info right) so there's zero layout shift.
 */
export default function ProductDetailSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center gap-2">
                <div className="skeleton-glass h-3 w-12 rounded" />
                <div className="skeleton-glass h-3 w-3 rounded" />
                <div className="skeleton-glass h-3 w-10 rounded" />
                <div className="skeleton-glass h-3 w-3 rounded" />
                <div className="skeleton-glass h-3 w-24 rounded" />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.25fr_500px]">
                {/* ── Gallery skeleton ── */}
                <div>
                    <div className="grid gap-5 lg:grid-cols-[96px_1fr]">
                        {/* Thumbs */}
                        <div className="order-2 flex gap-3 lg:order-1 lg:flex-col">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="skeleton-glass h-20 w-20 shrink-0 rounded-2xl lg:h-[88px] lg:w-[88px]"
                                />
                            ))}
                        </div>
                        {/* Main image */}
                        <div className="skeleton-glass order-1 aspect-[6/5] w-full rounded-[28px] lg:order-2" />
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton-glass h-20 rounded-2xl"
                            />
                        ))}
                    </div>
                </div>

                {/* ── Info skeleton ── */}
                <div className="space-y-6">
                    {/* Brand + title */}
                    <div className="space-y-3">
                        <div className="skeleton-glass h-3 w-24 rounded" />
                        <div className="skeleton-glass h-7 w-3/4 rounded-lg" />
                        <div className="skeleton-glass h-7 w-1/2 rounded-lg" />
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2">
                        <div className="skeleton-glass h-6 w-20 rounded-full" />
                        <div className="skeleton-glass h-6 w-24 rounded-full" />
                    </div>

                    {/* Price */}
                    <div className="skeleton-glass h-10 w-40 rounded-xl" />

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <div className="skeleton-glass h-14 flex-1 rounded-xl" />
                        <div className="skeleton-glass h-14 flex-1 rounded-xl" />
                    </div>

                    {/* Details card */}
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton-glass h-4 w-full rounded"
                            />
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                        <div className="skeleton-glass h-4 w-24 rounded" />
                        <div className="skeleton-glass h-3 w-full rounded" />
                        <div className="skeleton-glass h-3 w-5/6 rounded" />
                        <div className="skeleton-glass h-3 w-2/3 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
