"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    SlidersHorizontal,
    X,
    RotateCcw,
    Tags,
    Building2,
    Ruler,
    Banknote,
    Palette,
    Layers,
    BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import FilterCard from "./FilterCard";
import BrandFilter from "./BrandFilter";
import SizeFilter from "./SizeFilter";
import PriceFilter from "./PriceFilter";
import MeasurementFilter from "./MeasurementFilter";
import ColorFilter from "./ColorFilter";
import MaterialFilter from "./MaterialFilter";
import ConditionFilter from "./ConditionFilter";
import type { ShopFacets } from "@/hooks/useShopFacets";

interface FilterDrawerProps {
    genders: { id: string; slug: string; name: string }[];
    categories: { id: string; slug: string; name: string; gender: string }[];
    facets: ShopFacets;
}

export default function FilterDrawer({ genders, categories, facets }: FilterDrawerProps) {
    const [open, setOpen] = useState(false);
    const [expandedGender, setExpandedGender] = useState<string | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => { setOpen(false); }, [pathname, searchParams]);

    const activeCount = [
        searchParams.get("brand"),
        searchParams.get("size"),
        searchParams.get("price"),
        searchParams.get("measurement"),
        searchParams.get("color"),
        searchParams.get("material"),
        searchParams.get("condition"),
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
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1.5 text-badge font-bold text-background">
                        {activeCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-[90] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background pb-8 shadow-float"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <h2 className="font-bold text-foreground">Filters</h2>
                                    {activeCount > 0 && (
                                        <span className="rounded-full bg-foreground px-2 py-0.5 text-badge font-bold text-background">
                                            {activeCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeCount > 0 && (
                                        <Link
                                            href={pathname}
                                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-small font-semibold text-muted-foreground transition hover:bg-muted"
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

                            <div className="space-y-3 p-5">
                                <FilterCard
                                    icon={<Tags size={14} />}
                                    title="Category"
                                    defaultOpen
                                >
                                    <div className="flex flex-col gap-1">
                                        <Link
                                            href="/shop"
                                            className="rounded-xl border border-border bg-card px-3.5 py-2 text-body-sm font-medium text-muted-foreground transition hover:border-foreground hover:bg-muted"
                                        >
                                            All Items
                                        </Link>
                                        {genders.map((g) => {
                                            const genderCategories = categories.filter(
                                                (c) => c.gender.toLowerCase() === g.name.toLowerCase()
                                            );
                                            const isExpanded = expandedGender === g.slug;
                                            return (
                                                <div key={g.id} className="flex flex-col">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setExpandedGender(isExpanded ? null : g.slug)}
                                                        className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2 text-body-sm font-medium text-muted-foreground transition hover:border-foreground hover:bg-muted"
                                                    >
                                                        <span>{g.name}</span>
                                                        <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>›</span>
                                                    </Button>
                                                    {isExpanded && genderCategories.length > 0 && (
                                                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                                                            {genderCategories.map((c) => (
                                                                <Link
                                                                    key={c.id}
                                                                    href={`/shop/${g.slug}/${c.slug}`}
                                                                    className="rounded-lg px-3 py-1.5 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                                                                >
                                                                    {c.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </FilterCard>

                                <FilterCard icon={<Building2 size={14} />} title="Brand">
                                    <BrandFilter brands={facets.brands} />
                                </FilterCard>

                                <FilterCard icon={<Ruler size={14} />} title="Size">
                                    <SizeFilter sizes={facets.sizes} />
                                </FilterCard>

                                <FilterCard icon={<Banknote size={14} />} title="Price">
                                    <PriceFilter />
                                </FilterCard>

                                <FilterCard icon={<Palette size={14} />} title="Color">
                                    <ColorFilter colors={facets.colors} />
                                </FilterCard>

                                <FilterCard icon={<Layers size={14} />} title="Material">
                                    <MaterialFilter materials={facets.materials} />
                                </FilterCard>

                                <FilterCard icon={<BadgeCheck size={14} />} title="Condition">
                                    <ConditionFilter conditions={facets.conditions} />
                                </FilterCard>

                                <FilterCard icon={<Ruler size={14} />} title="Measurements">
                                    <MeasurementFilter />
                                </FilterCard>

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
                                        <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-small dark:bg-background/10">
                                            {activeCount}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
