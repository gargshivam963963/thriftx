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
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <div className="h-3 w-3 rounded bg-muted" />
                <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                <div className="h-3 w-3 rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
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
                                    className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-muted lg:h-[88px] lg:w-[88px]"
                                />
                            ))}
                        </div>
                        {/* Main image */}
                        <div className="order-1 aspect-[6/5] w-full animate-pulse rounded-[28px] bg-muted lg:order-2" />
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                </div>

                {/* ── Info skeleton ── */}
                <div className="space-y-6">
                    {/* Brand + title */}
                    <div className="space-y-3">
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-7 w-3/4 animate-pulse rounded-lg bg-muted" />
                        <div className="h-7 w-1/2 animate-pulse rounded-lg bg-muted" />
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                        <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                    </div>

                    {/* Price */}
                    <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <div className="h-14 flex-1 animate-pulse rounded-xl bg-muted" />
                        <div className="h-14 flex-1 animate-pulse rounded-xl bg-muted" />
                    </div>

                    {/* Details card */}
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-4 w-full animate-pulse rounded bg-muted"
                            />
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}
