"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    aiFilled?: boolean;
}

export default function FloatingInput({
    label,
    aiFilled,
    className,
    ...props
}: Props) {
    return (
        <div className="group relative">
            <input
                {...props}
                placeholder=" "
                className={cn(
                    "peer h-14 w-full rounded-2xl border border-neutral-300 bg-white px-4 pt-5 pb-2 outline-none transition-all",
                    "focus:border-black focus:ring-4 focus:ring-black/5",
                    aiFilled &&
                    "border-emerald-400 bg-emerald-50/50",
                    className
                )}
            />

            <label
                className="
                pointer-events-none
                absolute
                left-4
                top-4
                bg-white
                px-1
                text-neutral-500
                transition-all

                peer-placeholder-shown:top-4
                peer-placeholder-shown:text-base

                peer-focus:-top-2
                peer-focus:text-xs
                peer-focus:text-black

                peer-[:not(:placeholder-shown)]:-top-2
                peer-[:not(:placeholder-shown)]:text-xs
                "
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