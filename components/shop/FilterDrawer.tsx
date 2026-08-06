"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    SlidersHorizontal,
    X,
    RotateCcw,
    ChevronDown,
    Tags,
    Building2,
    Ruler,
    Banknote,
} from "lucide-react";
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

function AccordionSection({
    icon,
    title,
    defaultOpen = false,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-4 py-3 text-body-sm font-semibold text-foreground transition hover:bg-muted"
            >
                <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted">
                        {icon}
                    </span>
                    {title}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={14} className="text-muted-foreground" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FilterDrawer({ genders, categories, brands }: FilterDrawerProps) {
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
                            className="fixed inset-x-0 bottom-0 z-[90] max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background pb-8 shadow-float"
                        >
                            {/* Sticky header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/30" />
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

                            {/* Filter content with accordions */}
                            <div className="space-y-3 p-5">
                                {/* Category — default open */}
                                <AccordionSection
                                    icon={<Tags size={13} className="text-muted-foreground" />}
                                    title="Category"
                                    defaultOpen={true}
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
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedGender(isExpanded ? null : g.slug)
                                                        }
                                                        className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2 text-body-sm font-medium text-muted-foreground transition hover:border-foreground hover:bg-muted"
                                                    >
                                                        <span>{g.name}</span>
                                                        <ChevronDown
                                                            size={14}
                                                            className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </button>
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
                                </AccordionSection>

                                {/* Brand */}
                                <AccordionSection
                                    icon={<Building2 size={13} className="text-muted-foreground" />}
                                    title="Brand"
                                >
                                    <BrandFilter brands={brands} />
                                </AccordionSection>

                                {/* Size */}
                                <AccordionSection
                                    icon={<Ruler size={13} className="text-muted-foreground" />}
                                    title="Size"
                                >
                                    <SizeFilter />
                                </AccordionSection>

                                {/* Price */}
                                <AccordionSection
                                    icon={<Banknote size={13} className="text-muted-foreground" />}
                                    title="Price"
                                >
                                    <PriceFilter />
                                </AccordionSection>

                                {/* Measurements */}
                                <AccordionSection
                                    icon={<Ruler size={13} className="text-muted-foreground" />}
                                    title="Measurements"
                                >
                                    <MeasurementFilter />
                                </AccordionSection>

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
                                            <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-small dark:bg-background/10">
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

