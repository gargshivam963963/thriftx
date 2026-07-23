"use client";

export default function ProductCardSkeleton() {
    return (
        <div
            className="
        overflow-hidden
        rounded-[24px]
        border
        border-neutral-200
        bg-white
        shadow-sm
      "
        >
            {/* IMAGE */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                <div className="absolute inset-0 animate-pulse bg-neutral-200" />

                <div className="absolute left-4 top-4 h-7 w-24 rounded-full bg-neutral-300" />

                <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-neutral-300" />

                <div className="absolute bottom-4 left-4 right-4 h-12 rounded-xl bg-neutral-300" />
            </div>

            {/* CONTENT */}
            <div className="space-y-4 p-5">
                <div className="h-3 w-20 rounded-full bg-neutral-200" />

                <div className="space-y-2">
                    <div className="h-5 w-full rounded bg-neutral-200" />
                    <div className="h-5 w-3/4 rounded bg-neutral-200" />
                </div>

                <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-full bg-neutral-200" />
                    <div className="h-7 w-24 rounded-full bg-neutral-200" />
                </div>

                <div className="pt-4">
                    <div className="mb-2 h-3 w-12 rounded bg-neutral-200" />
                    <div className="h-9 w-28 rounded bg-neutral-300" />
                </div>
            </div>
        </div>
    );
}