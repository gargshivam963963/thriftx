"use client";

/**
 * ProductInfoSkeleton — placeholder for the product information column
 * (brand, title, price, actions, details). Shown while data hydrates.
 */
export default function ProductInfoSkeleton() {
    return (
        <div className="space-y-6">
            {/* Brand + title */}
            <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
                <div className="h-10 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
            </div>

            {/* Details card */}
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}
