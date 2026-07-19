"use client";

import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    aiFilled?: boolean;
}

export default function FloatingTextarea({
    label,
    aiFilled,
    className,
    ...props
}: Props) {
    return (
        <div className="relative">

            <textarea
                {...props}
                placeholder=" "
                className={cn(
                    "peer w-full rounded-2xl border border-neutral-300 bg-white p-4 pt-6 outline-none transition resize-none",
                    "focus:border-black focus:ring-4 focus:ring-black/5",
                    aiFilled &&
                    "border-emerald-400 bg-emerald-50/50",
                    className
                )}
            />

            <label
                className="
                absolute
                left-4
                -top-2
                bg-white
                px-1
                text-xs
                text-neutral-500"
            >
                {label}
            </label>

            {aiFilled && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    AI
                </span>
            )}

        </div>
    );
}