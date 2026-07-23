"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    aiFilled?: boolean;
    error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, Props>(
    ({ label, aiFilled, error, className, ...props }, ref) => {
        return (
            <div className="group relative">
                <input
                    {...props}
                    ref={ref}
                    placeholder=" "
                    className={cn(
                        "peer h-14 w-full rounded-2xl border bg-white px-4 pt-5 pb-2 outline-none transition-all",
                        "focus:ring-4",
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/5",
                        aiFilled && "border-emerald-400 bg-emerald-50/50",
                        className
                    )}
                />

                <label
                    className={cn(
                        "pointer-events-none absolute left-4 top-4 bg-white px-1 text-neutral-500 transition-all",
                        "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base",
                        "peer-focus:-top-2 peer-focus:text-xs",
                        "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs",
                        error && "text-red-500 peer-focus:text-red-500"
                    )}
                >
                    {label}
                </label>

                {error && (
                    <p className="mt-1.5 flex items-center gap-1 px-1 text-xs text-red-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </p>
                )}

                {aiFilled && !error && (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        AI
                    </span>
                )}
            </div>
        );
    }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;

