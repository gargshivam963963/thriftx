"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export function Tooltip({
    content,
    children,
    side = "top",
    className,
}: TooltipProps) {
    return (
        <div className="group relative inline-flex">
            {children}
            <div
                role="tooltip"
                className={cn(
                    "pointer-events-none absolute z-[999] whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900",
                    side === "top" && "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
                    side === "bottom" && "top-full left-1/2 mt-1.5 -translate-x-1/2",
                    side === "left" && "right-full top-1/2 mr-1.5 -translate-y-1/2",
                    side === "right" && "left-full top-1/2 ml-1.5 -translate-y-1/2",
                    className,
                )}
            >
                {content}
            </div>
        </div>
    );
}

