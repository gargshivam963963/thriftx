"use client";

import { cn } from "@/lib/utils";

interface ImageSkeletonProps {
    className?: string;
}

export default function ImageSkeleton({
    className,
}: ImageSkeletonProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden rounded-inherit bg-neutral-100",
                className
            )}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
    );
}