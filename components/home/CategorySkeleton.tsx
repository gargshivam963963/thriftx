"use client";

export default function CategorySkeleton() {
    return (
        <div
            className="
        overflow-hidden
        rounded-[28px]
        border
        border-border
        bg-card
        shadow-card
      "
        >
            {/* IMAGE */}
            <div className="skeleton-glass relative aspect-[4/5] overflow-hidden">
                <div className="absolute left-5 top-5 h-7 w-24 rounded-full bg-foreground/10 dark:bg-foreground/15" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-4 h-3 w-28 rounded-full bg-foreground/10 dark:bg-foreground/15" />

                    <div className="mb-6 h-9 w-40 rounded-xl bg-foreground/10 dark:bg-foreground/15" />

                    <div className="flex items-center justify-between">
                        <div className="h-4 w-32 rounded bg-foreground/10 dark:bg-foreground/15" />

                        <div className="h-11 w-11 rounded-full bg-foreground/10 dark:bg-foreground/15" />
                    </div>
                </div>
            </div>
        </div>
    );
}