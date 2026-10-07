"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
import FilterAccordion from "@/components/ui/FilterAccordion";
import {
    modalBackdropVariants,
    sheetVariants,
} from "@/components/animations/Motion";

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

export default function FilterDrawer({
    genders,
    categories,
    facets,
}: FilterDrawerProps) {
    const [open, setOpen] = useState(false);
    const [expandedGender, setExpandedGender] = useState<string | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setOpen(false);
    }, [pathname, searchParams]);

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
        return () => {
            document.body.style.overflow = "";
        };
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
                <SlidersHorizontal size={16} />
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
                            variants={modalBackdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            variants={sheetVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-x-0 bottom-0 z-[90] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/40 bg-white/70 pb-8 shadow-float backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/75"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/40 bg-white/60 px-5 py-4 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/60">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Filters
                                    </h2>
                                    {activeCount > 0 && (
                                        <span className="rounded-full bg-foreground px-2 py-0.5 text-badge font-bold text-background">
                                            {activeCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeCount > 0 && (
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            rounded="lg"
                                            leftIcon={<RotateCcw size={14} />}
                                        >
                                            <Link href={pathname}>Reset</Link>
                                        </Button>
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
                                <FilterAccordion
                                    icon={<Tags size={16} />}
                                    title="Category"
                                    defaultOpen
                                >
                                    <div className="flex flex-col gap-1">
                                        <Link
                                            href="/shop"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-card"
                                        >
                                            All Items
                                        </Link>
                                        {genders.map((g) => {
                                            const genderCategories = categories.filter(
                                                (c) =>
                                                    c.gender.toLowerCase() === g.name.toLowerCase()
                                            );
                                            const isExpanded = expandedGender === g.slug;
                                            return (
                                                <div key={g.id} className="flex flex-col">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        fullWidth
                                                        onClick={() =>
                                                            setExpandedGender(isExpanded ? null : g.slug)
                                                        }
                                                        className="justify-between rounded-lg px-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card"
                                                    >
                                                        <span className="truncate">{g.name}</span>
                                                        <ChevronR />
                                                    </Button>
                                                    {isExpanded && genderCategories.length > 0 && (
                                                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                                                            {genderCategories.map((c) => (
                                                                <Link
                                                                    key={c.id}
                                                                    href={`/shop/${g.slug}/${c.slug}`}
                                                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                                </FilterAccordion>

                                <FilterAccordion icon={<Building2 size={16} />} title="Brand">
                                    <BrandFilter brands={facets.brands} />
                                </FilterAccordion>

                                <FilterAccordion icon={<Ruler size={16} />} title="Size">
                                    <SizeFilter sizes={facets.sizes} />
                                </FilterAccordion>

                                <FilterAccordion icon={<Banknote size={16} />} title="Price">
                                    <PriceFilter />
                                </FilterAccordion>

                                <FilterAccordion icon={<Palette size={16} />} title="Color">
                                    <ColorFilter colors={facets.colors} />
                                </FilterAccordion>

                                <FilterAccordion icon={<Layers size={16} />} title="Material">
                                    <MaterialFilter materials={facets.materials} />
                                </FilterAccordion>

                                <FilterAccordion
                                    icon={<BadgeCheck size={16} />}
                                    title="Condition"
                                >
                                    <ConditionFilter conditions={facets.conditions} />
                                </FilterAccordion>

                                <FilterAccordion icon={<Ruler size={16} />} title="Measurements">
                                    <MeasurementFilter />
                                </FilterAccordion>

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

function ChevronR() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-muted-foreground"
        >
            <path
                d="M5 3L10 7L5 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
