"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    controlBase,
    controlIcon,
    controlFocusRing,
} from "@/components/ui/control.styles";

const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Best Selling" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Alphabetical" },
];

export default function SortDropdown({
    defaultValue,
}: {
    defaultValue: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentLabel =
        sortOptions.find((o) => o.value === defaultValue)?.label ?? "Sort";

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleSelect(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`${pathname}?${params.toString()}`);
        setOpen(false);
    }

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    controlBase,
                    "border border-border bg-card",
                    "hover:border-foreground/60",
                    "dark:border-border dark:bg-card",
                    "shrink-0",
                )}
            >
                <ArrowUpDown
                    size={16}
                    className={cn(controlIcon, "shrink-0 text-muted-foreground")}
                />
                <span className="hidden sm:inline">{currentLabel}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown
                    size={16}
                    className={cn(
                        controlIcon,
                        "shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180",
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-float"
                    >
                        <div className="p-1.5">
                            {sortOptions.map((opt) => {
                                const active = defaultValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        role="option"
                                        aria-selected={active}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                                            controlFocusRing,
                                            active
                                                ? "bg-foreground text-background"
                                                : "text-foreground hover:bg-muted dark:hover:bg-card",
                                        )}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {active && (
                                            <Check size={15} strokeWidth={3} className="h-4 w-4 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
