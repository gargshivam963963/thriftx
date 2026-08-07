"use client";

import { cn } from "@/lib/utils";

/**
 * ProductGallerySkeleton — shimmer/placeholder shown while the
 * product gallery loads. Mirrors the gallery layout (thumbnails + main)
 * to prevent layout shift.
 */
export default function ProductGallerySkeleton() {
    return (
        <div className="grid gap-5 lg:grid-cols-[96px_1fr]">
            {/* Thumbnails */}
            <div className="order-2 flex gap-3 overflow-hidden pb-2 lg:order-1 lg:flex-col lg:overflow-visible">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted"
                    >
                        <div className="h-full w-full animate-pulse bg-muted" />
                    </div>
                ))}
            </div>

            {/* Main image */}
            <div className="relative order-1 aspect-[6/5] overflow-hidden rounded-[24px] bg-muted">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <div className="absolute left-6 top-6 h-9 w-20 rounded-full bg-muted-foreground/20" />
                <div className="absolute right-6 top-6 h-11 w-11 rounded-full bg-muted-foreground/20" />
            </div>
        </div>
    );
}
