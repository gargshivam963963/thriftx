"use client";

export default function CategorySkeleton() {
    return (
        <div
            className="
        overflow-hidden
        rounded-[28px]
        border
        border-neutral-100
        bg-white
        shadow-[0_8px_30px_rgba(0,0,0,.05)]
      "
        >
            {/* IMAGE */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                <div className="absolute inset-0 animate-pulse bg-neutral-200" />

                <div className="absolute left-5 top-5 h-7 w-24 rounded-full bg-neutral-300" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-4 h-3 w-28 rounded-full bg-neutral-300" />

                    <div className="mb-6 h-9 w-40 rounded bg-neutral-300" />

                    <div className="flex items-center justify-between">
                        <div className="h-4 w-32 rounded bg-neutral-300" />

                        <div className="h-11 w-11 rounded-full bg-neutral-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}