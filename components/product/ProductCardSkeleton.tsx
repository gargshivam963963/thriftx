"use client";

export default function ProductCardSkeleton() {
    return (
        <div
            className="
        overflow-hidden
        rounded-[24px]
        border
        border-border
        bg-card
        shadow-sm
      "
        >
            {/* IMAGE */}
            <div className="skeleton-glass relative aspect-[4/5] overflow-hidden">
                <div className="absolute left-4 top-4 h-7 w-24 rounded-full bg-foreground/10 dark:bg-foreground/15" />
                <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-foreground/10 dark:bg-foreground/15" />
                <div className="absolute bottom-4 left-4 right-4 h-12 rounded-xl bg-foreground/10 dark:bg-foreground/15" />
            </div>

            {/* CONTENT */}
            <div className="space-y-4 p-5">
                <div className="skeleton-glass h-3 w-20 rounded-full" />

                <div className="space-y-2">
                    <div className="skeleton-glass h-5 w-full rounded-lg" />
                    <div className="skeleton-glass h-5 w-3/4 rounded-lg" />
                </div>

                <div className="flex gap-2">
                    <div className="skeleton-glass h-7 w-20 rounded-full" />
                    <div className="skeleton-glass h-7 w-24 rounded-full" />
                </div>

                <div className="pt-4">
                    <div className="skeleton-glass mb-2 h-3 w-12 rounded" />
                    <div className="skeleton-glass h-9 w-28 rounded-xl" />
                </div>
            </div>
        </div>
    );
}