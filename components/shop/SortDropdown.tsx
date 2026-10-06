"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { menuVariants } from "@/components/animations/Motion";
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
        // Changing the filter or sort re-orders the result set, so the
        // current page number is no longer meaningful — start at page 1.
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
        setOpen(false);
    }

    return (
        <div ref={ref} className="relative shrink-0">
            <Button
                type="button"
                variant="outline"
                size="sm"
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
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-float"
                    >
                        <div className="p-1.5">
                            {sortOptions.map((opt) => {
                                const active = defaultValue === opt.value;
                                return (
                                    <Button
                                        key={opt.value}
                                        variant={active ? "primary" : "ghost"}
                                        size="sm"
                                        fullWidth
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            "justify-between rounded-lg px-3.5 py-2.5 text-left",
                                            !active && "text-foreground hover:bg-muted dark:hover:bg-card",
                                        )}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {active && (
                                            <Check size={15} strokeWidth={3} className="h-4 w-4 shrink-0" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
