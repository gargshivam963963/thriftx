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
                <div className="skeleton-glass h-3 w-24 rounded" />
                <div className="skeleton-glass h-8 w-3/4 rounded-lg" />
                <div className="flex gap-2">
                    <div className="skeleton-glass h-6 w-20 rounded-full" />
                    <div className="skeleton-glass h-6 w-24 rounded-full" />
                </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
                <div className="skeleton-glass h-10 w-40 rounded-xl" />
                <div className="skeleton-glass h-4 w-56 rounded" />
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <div className="skeleton-glass h-14 w-full rounded-xl" />
                <div className="skeleton-glass h-14 w-full rounded-xl" />
            </div>

            {/* Details card */}
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                <div className="skeleton-glass h-4 w-32 rounded" />
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                        <div className="skeleton-glass h-3 w-20 rounded" />
                        <div className="skeleton-glass h-3 w-24 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
