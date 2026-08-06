"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Alphabetical" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
];

export default function SortDropdown({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentLabel = sortOptions.find((o) => o.value === defaultValue)?.label ?? "Sort";

    // Close on outside click
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
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex h-11 items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-body-sm font-medium text-foreground shadow-card transition-all hover:border-foreground hover:shadow-md"
            >
                <ArrowUpDown size={14} className="shrink-0 text-muted-foreground" />
                <span className="hidden sm:inline">{currentLabel}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-float"
                    >
                        <div className="p-1.5">
                            {sortOptions.map((opt) => {
                                const active = defaultValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`
                                            flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium
                                            transition-all duration-150
                                            ${active
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                : "text-foreground hover:bg-muted"
                                            }
                                        `}
                                    >
                                        <span>{opt.label}</span>
                                        {active && (
                                            <Check size={15} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
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

