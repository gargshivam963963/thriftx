"use client";

interface Props {
    list?: boolean;
}

export default function ProductCardSkeleton({ list = false }: Props) {
    if (list) {
        return (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row">
                <div className="relative aspect-[4/5] w-full sm:aspect-[3/4] sm:w-[200px] sm:shrink-0 overflow-hidden bg-muted">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="h-3 w-1/4 rounded-full bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-5 w-2/3 rounded-full bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-3 w-3/4 rounded-full bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="h-6 w-1/5 rounded-lg bg-muted">
                            <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-lg bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                        <div className="h-10 w-28 rounded-2xl bg-muted">
                            <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-2xl bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 rounded-full bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-2.5 w-16 rounded-full bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                </div>
                <div className="h-4 w-3/4 rounded-full bg-muted">
                    <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-3 w-1/3 rounded-full bg-muted">
                    <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="h-5 w-1/4 rounded-lg bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-lg bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-muted">
                        <div className="h-full w-full -translate-x-full animate-[shimmer_1.8s_infinite] rounded-xl bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}

