"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import BrandFilter from "./BrandFilter";
import SizeFilter from "./SizeFilter";
import PriceFilter from "./PriceFilter";
import MeasurementFilter from "./MeasurementFilter";

interface FilterDrawerProps {
    genders: { id: string; slug: string; name: string }[];
    categories: { id: string; slug: string; name: string; gender: string }[];
    brands: string[];
}

export default function FilterDrawer({ genders, categories, brands }: FilterDrawerProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => { setOpen(false); }, [pathname, searchParams]);

    const activeCount = [
        searchParams.get("brand"),
        searchParams.get("size"),
        searchParams.get("price"),
        searchParams.get("measurement"),
    ].filter(Boolean).length;

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                variant="outline"
                size="md"
                rounded="lg"
            >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                {activeCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                        {activeCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />

                        {/* Drawer panel */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-[90] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-neutral-200 bg-white pb-8 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
                        >
                            {/* Sticky header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-5 py-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Filters</h2>
                                    {activeCount > 0 && (
                                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                                            {activeCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeCount > 0 && (
                                        <Link
                                            href={pathname}
                                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                        >
                                            <RotateCcw size={13} /> Reset
                                        </Link>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        variant="ghost"
                                        size="iconSm"
                                        rounded="lg"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Filter content */}
                            <div className="space-y-5 p-5">
                                {/* Category */}
                                <div>
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Category</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href="/shop"
                                            className="rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
                                        >
                                            All
                                        </Link>
                                        {genders.map((g) => (
                                            <Link
                                                key={g.id}
                                                href={`/shop/${g.slug}`}
                                                className="rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
                                            >
                                                {g.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                                {/* Brand */}
                                <div>
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Brand</h3>
                                    <BrandFilter brands={brands} />
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                                {/* Size */}
                                <div>
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Size</h3>
                                    <SizeFilter />
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                                {/* Price */}
                                <div>
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Price</h3>
                                    <PriceFilter />
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                                {/* Measurements */}
                                <div>
                                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Measurements</h3>
                                    <MeasurementFilter />
                                </div>

                                {/* Apply button */}
                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        variant="primary"
                                        size="lg"
                                        rounded="xl"
                                        fullWidth
                                    >
                                        Apply Filters
                                        {activeCount > 0 && (
                                            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs dark:bg-black/10">
                                                {activeCount}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
