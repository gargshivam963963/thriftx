"use client";

import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
    view?: "grid" | "list";
    count?: number;
}

export default function ProductSkeleton({ view = "grid", count = 8 }: ProductSkeletonProps) {
    return (
        <div
            className={cn(
                view === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-2"
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-border/70 bg-card p-0 dark:border-border/50"
                >
                    {view === "grid" ? (
                        <div className="space-y-3">
                            <div className="skeleton-glass h-44 rounded-t-2xl" />
                            <div className="space-y-2.5 p-4 pt-2">
                                <div className="skeleton-glass h-3 w-1/3 rounded-full" />
                                <div className="skeleton-glass h-4 w-3/4 rounded-full" />
                                <div className="skeleton-glass h-3 w-1/4 rounded-full" />
                                <div className="flex items-center justify-between pt-1">
                                    <div className="skeleton-glass h-5 w-1/4 rounded-lg" />
                                    <div className="skeleton-glass h-4 w-16 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4">
                            <div className="skeleton-glass h-12 w-12 shrink-0 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton-glass h-3 w-1/2 rounded-full" />
                                <div className="skeleton-glass h-3 w-1/3 rounded-full" />
                            </div>
                            <div className="skeleton-glass h-5 w-16 rounded-lg" />
                            <div className="skeleton-glass h-5 w-20 rounded-lg" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

