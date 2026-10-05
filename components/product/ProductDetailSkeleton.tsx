"use client";

const shimmer =
    "relative overflow-hidden rounded-xl bg-black/[0.045] dark:bg-white/[0.07] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/55 before:to-transparent dark:before:via-white/10";

function SkeletonBlock({
    className = "",
}: {
    className?: string;
}) {
    return <div aria-hidden="true" className={`${shimmer} ${className}`} />;
}

export default function ProductDetailSkeleton() {
    return (
        <main
            aria-busy="true"
            aria-label="Loading product details"
            className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8"
        >
            {/* Breadcrumb */}
            <div className="mb-7 flex items-center gap-3">
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonBlock className="h-3 w-3 rounded-full" />
                <SkeletonBlock className="h-3 w-10" />
                <SkeletonBlock className="h-3 w-3 rounded-full" />
                <SkeletonBlock className="h-3 w-28" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-10 xl:gap-14">
                {/* Gallery */}
                <section className="min-w-0">
                    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-5">
                        <div className="flex flex-col gap-3">
                            {[0, 1, 2, 3, 4].map((item) => (
                                <SkeletonBlock
                                    key={item}
                                    className="aspect-[4/5] w-full rounded-xl sm:rounded-2xl"
                                />
                            ))}
                        </div>

                        <div className="rounded-[24px] bg-black/[0.025] p-2 dark:bg-white/[0.025] sm:rounded-[30px] sm:p-3">
                            <SkeletonBlock className="aspect-[4/5] w-full rounded-[18px] sm:rounded-[24px]" />
                        </div>
                    </div>

                    {/* Trust highlights */}
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[0, 1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex min-h-[76px] items-center gap-3 rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.035]"
                            >
                                <SkeletonBlock className="size-9 shrink-0 rounded-xl" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <SkeletonBlock className="h-3 w-4/5" />
                                    <SkeletonBlock className="h-2.5 w-3/5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Measurements */}
                    <div className="mt-6 rounded-[24px] bg-black/[0.025] p-4 dark:bg-white/[0.035] sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <SkeletonBlock className="size-10 rounded-xl" />
                            <div className="space-y-2">
                                <SkeletonBlock className="h-5 w-36" />
                                <SkeletonBlock className="h-3 w-44" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[0, 1].map((item) => (
                                <div
                                    key={item}
                                    className="space-y-4 rounded-2xl bg-white/65 p-4 dark:bg-white/[0.035] sm:p-5"
                                >
                                    <SkeletonBlock className="size-8 rounded-lg" />
                                    <SkeletonBlock className="h-3 w-16" />
                                    <SkeletonBlock className="h-8 w-20" />
                                </div>
                            ))}
                        </div>

                        <SkeletonBlock className="mt-4 h-3 w-4/5" />
                    </div>

                    {/* Description */}
                    <div className="mt-5 rounded-[24px] bg-black/[0.025] p-5 dark:bg-white/[0.035] sm:p-6">
                        <SkeletonBlock className="mb-5 h-6 w-48" />
                        <div className="space-y-3">
                            <SkeletonBlock className="h-3 w-full" />
                            <SkeletonBlock className="h-3 w-[92%]" />
                            <SkeletonBlock className="h-3 w-[76%]" />
                        </div>
                    </div>
                </section>

                {/* Product information */}
                <section className="min-w-0 lg:sticky lg:top-6 lg:self-start">
                    <div className="space-y-5">
                        <div className="space-y-4">
                            <SkeletonBlock className="h-3 w-20" />
                            <SkeletonBlock className="h-9 w-[88%] sm:h-11" />
                            <SkeletonBlock className="h-9 w-[62%] sm:h-11" />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <SkeletonBlock className="h-8 w-24 rounded-full" />
                            <SkeletonBlock className="h-8 w-32 rounded-full" />
                            <SkeletonBlock className="h-8 w-24 rounded-full" />
                        </div>

                        {/* Price surface */}
                        <div className="rounded-[22px] bg-black/[0.025] p-5 dark:bg-white/[0.035] sm:p-6">
                            <SkeletonBlock className="h-11 w-36" />
                            <SkeletonBlock className="mt-3 h-3 w-48" />
                        </div>

                        {/* Purchase actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <SkeletonBlock className="h-14 rounded-2xl" />
                            <SkeletonBlock className="h-14 rounded-2xl" />
                        </div>

                        <div className="flex justify-center">
                            <SkeletonBlock className="h-3 w-56" />
                        </div>

                        {/* Delivery */}
                        <div className="rounded-[22px] bg-black/[0.025] p-5 dark:bg-white/[0.035] sm:p-6">
                            <div className="flex gap-4">
                                <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
                                <div className="min-w-0 flex-1 space-y-3">
                                    <SkeletonBlock className="h-5 w-40" />
                                    <SkeletonBlock className="h-3 w-full" />
                                    <SkeletonBlock className="h-3 w-[78%]" />
                                    <SkeletonBlock className="mt-4 h-px w-full rounded-none" />
                                    <SkeletonBlock className="h-3 w-3/4" />
                                </div>
                            </div>
                        </div>

                        {/* Product specifications */}
                        <div className="rounded-[22px] bg-black/[0.025] p-5 dark:bg-white/[0.035] sm:p-6">
                            <SkeletonBlock className="mb-2 h-7 w-48" />
                            <SkeletonBlock className="mb-5 h-3 w-36" />

                            <div className="space-y-5">
                                {[0, 1, 2, 3, 4, 5, 6].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <SkeletonBlock className="h-3 w-20" />
                                        <SkeletonBlock className="h-3 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <span className="sr-only">Please wait while the product loads.</span>
        </main>
    );
}