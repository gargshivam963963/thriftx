"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface PageSkeletonProps {
    header?: boolean;
    sidebar?: boolean;
    cards?: number;
    cardHeight?: number;
    className?: string;
}

interface SkeletonProps
    extends HTMLAttributes<HTMLDivElement> { }

function Skeleton({
    className,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-2xl bg-neutral-200",
                className
            )}
            {...props}
        />
    );
}

export default function PageSkeleton({
    header = true,
    sidebar = false,
    cards = 4,
    cardHeight = 260,
    className,
}: PageSkeletonProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 xl:px-8",
                className
            )}
        >
            {header && (
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
            )}

            <div
                className={cn(
                    "grid gap-6",
                    sidebar &&
                    "xl:grid-cols-[minmax(0,1fr)_360px]"
                )}
            >
                <div className="space-y-6">
                    {Array.from({
                        length: cards,
                    }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="w-full"
                            style={{
                                height: cardHeight,
                            }}
                        />
                    ))}
                </div>

                {sidebar && (
                    <div className="hidden space-y-6 xl:block">
                        <Skeleton className="h-[420px]" />
                        <Skeleton className="h-[300px]" />
                    </div>
                )}
            </div>
        </div>
    );
}