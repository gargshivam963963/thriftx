"use client";

export default function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-8">

            <div className="h-44 rounded-3xl bg-neutral-200" />

            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-3xl border bg-white p-8"
                >
                    <div className="mb-8 flex items-center gap-4">

                        <div className="h-14 w-14 rounded-2xl bg-neutral-200" />

                        <div className="space-y-2">

                            <div className="h-5 w-56 rounded bg-neutral-200" />

                            <div className="h-4 w-80 rounded bg-neutral-100" />

                        </div>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        {Array.from({ length: 6 }).map((_, j) => (
                            <div
                                key={j}
                                className="space-y-2"
                            >
                                <div className="h-4 w-20 rounded bg-neutral-200" />

                                <div className="h-12 rounded-2xl bg-neutral-100" />

                            </div>
                        ))}

                    </div>

                </div>
            ))}

        </div>
    );
}