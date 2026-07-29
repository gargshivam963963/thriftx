"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";
import {
    LayoutGrid,
    List,
    ChevronDown,
    RotateCcw,
    AlertCircle,
    Home,
    Tags,
    Building2,
    Ruler,
    Banknote,
    Star,
    SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/services/products";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import ProductCardGrid from "@/components/shop/ProductCardGrid";
import ProductCardList from "@/components/shop/ProductCardList";
import ProductCardSkeleton from "@/components/shop/ProductCardSkeleton";
import BrandFilter from "@/components/shop/BrandFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import PriceFilter from "@/components/shop/PriceFilter";
import MeasurementFilter from "@/components/shop/MeasurementFilter";
import SortDropdown from "@/components/shop/SortDropdown";
import FilterDrawer from "@/components/shop/FilterDrawer";

interface ShopContentProps {
    products: Product[];
    genders: { id: string; slug: string; name: string }[];
    categories: { id: string; slug: string; name: string; gender: string }[];
    brands: string[];
    gender: string;
    clothingCategory: string;
    categoryTitle: string;
    category: string[];
    initialSort: string;
    initialBrand: string | null | undefined;
    initialSize: string | null | undefined;
    initialPrice: string | null | undefined;
    initialMeasurement: string | null | undefined;
    initialSearch?: string | null | undefined;
}

const ITEMS_PER_PAGE = 12;

// ─── Accordion Section ──────────────────────────────────────────────────────────

function SidebarAccordion({
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
        <div className="border-b border-neutral-200 pb-5 last:border-none">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
            >
                <span className="flex items-center gap-2">
                    <span className="text-neutral-500">
                        {icon}
                    </span>
                    {title}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={14} className="text-neutral-400" />
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ShopContent({
    products,
    genders,
    categories,
    brands,
    gender,
    clothingCategory,
    categoryTitle,
    category,
    initialSort,
    initialBrand,
    initialSize,
    initialPrice,
    initialMeasurement,
    initialSearch,
}: ShopContentProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { trackSearch } = useAnalytics();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const baseUrl = gender
        ? `/shop/${gender}${clothingCategory ? `/${clothingCategory}` : ""}`
        : "/shop";

    const hasActiveFilters =
        initialBrand || initialSize || initialPrice || initialMeasurement || initialSearch;

    const activeFilterCount = [
        initialBrand,
        initialSize,
        initialPrice,
        initialMeasurement,
        initialSearch,
    ].filter((v) => v !== null && v !== undefined).length;

    /**
     * Parse measurement query param: "chest-24", "waist-30", "length-28", "inseam-28"
     * Returns { type, value } or null
     */
    const parsedMeasurement = useMemo(() => {
        if (!initialMeasurement) return null;
        const match = initialMeasurement.match(/^(chest|waist|length|inseam)-(\d+)(?:-plus)?$/);
        if (!match) return null;
        return { type: match[1] as "chest" | "waist" | "length" | "inseam", value: parseInt(match[2], 10) };
    }, [initialMeasurement]);

    const filteredProducts = useMemo(() => {
        let results = products;

        // Search filter
        if (initialSearch) {
            const q = initialSearch.toLowerCase().trim();
            results = results.filter(
                (p) =>
                    p.title?.toLowerCase().includes(q) ||
                    p.brand?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
            );
        }

        // Measurement filter
        if (parsedMeasurement) {
            const { type, value } = parsedMeasurement;
            results = results.filter((p) => {
                const fieldValue = p[type];
                if (!fieldValue) return false;
                const numVal = parseInt(fieldValue.toString().replace(/[^\d]/g, ""), 10);
                if (isNaN(numVal)) return false;
                // "plus" means >= value, otherwise exact match within range
                if (initialMeasurement?.endsWith("-plus")) {
                    return numVal >= value;
                }
                // Range match: within ±2 inches of the selected value
                return Math.abs(numVal - value) <= 2;
            });
        }

        return results;
    }, [products, initialSearch, parsedMeasurement, initialMeasurement]);

    const searchTrackedRef = useRef(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchParams]);

    useEffect(() => {
        if (initialSearch && !searchTrackedRef.current) {
            searchTrackedRef.current = true;
            trackSearch(initialSearch, filteredProducts.length);
        }
    }, [initialSearch, filteredProducts.length, trackSearch]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageProducts = useMemo(
        () => filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE),
        [filteredProducts, startIndex]
    );

    const handleLoadMore = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
            setLoading(false);
        }, 400);
    }, []);

    const itemsLoaded = currentPage * ITEMS_PER_PAGE;

    // Build breadcrumb trail
    const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [
        { label: "Home", href: "/", isLast: false },
        { label: "Shop", href: "/shop", isLast: false },
    ];
    if (gender) {
        const genderName = genders.find((g) => g.slug === gender)?.name || gender.charAt(0).toUpperCase() + gender.slice(1);
        breadcrumbs.push({ label: genderName, href: `/shop/${gender}`, isLast: !clothingCategory });
    }
    if (clothingCategory) {
        breadcrumbs.push({ label: categoryTitle, href: `/shop/${gender}/${clothingCategory}`, isLast: true });
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
            {/* ── Breadcrumbs ──────────────────────────────── */}
            {/* <div className="px-4 sm:px-6 lg:px-8 mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, i) => (
                            <BreadcrumbItem key={crumb.href}>
                                {i > 0 && <BreadcrumbSeparator />}
                                {crumb.isLast ? (
                                    <BreadcrumbPage className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        href={crumb.href}
                                        className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 flex items-center gap-1"
                                    >
                                        {i === 0 && <Home size={10} />}
                                        {crumb.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div> */}

            <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
                {/* ── SIDEBAR (Desktop) ─────────────────────────────── */}
                <aside className="hidden lg:sticky lg:top-24 lg:flex g:w-[260px] xl:w-[280px] lg:shrink-0 lg:self-start lg:flex-col lg:gap-5">
                    <div className="space-y-5">
                        <div className="mb-4 flex items-center justify-between">

                            <h2 className="text-3xl font-bold">
                                Filters
                            </h2>

                            {hasActiveFilters && (
                                <Link href={baseUrl} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-200">
                                    <RotateCcw size={11} /> Reset
                                </Link>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Category — default open */}
                            <SidebarAccordion
                                icon={<Tags size={13} className="text-neutral-500" />}
                                title="Category"
                                defaultOpen={true}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <Link
                                        href="/shop"
                                        className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${!gender ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}
                                    >
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${!gender ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"}`}>
                                            <Star size={9} />
                                        </span>
                                        All Items
                                    </Link>
                                    {genders.map((g) => (
                                        <div key={g.id}>
                                            <Link
                                                href={`/shop/${g.slug}`}
                                                className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${gender === g.slug && !clothingCategory ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}
                                            >
                                                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${gender === g.slug && !clothingCategory ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"}`}>
                                                    {g.name.charAt(0)}
                                                </span>
                                                {g.name}
                                            </Link>
                                            {gender === g.slug && (
                                                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                                                    {categories
                                                        .filter((c) => c.gender.toLowerCase() === g.name.toLowerCase())
                                                        .map((c) => (
                                                            <Link
                                                                key={c.id}
                                                                href={`/shop/${g.slug}/${c.slug}`}
                                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${clothingCategory === c.slug ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`}
                                                            >
                                                                {c.name}
                                                            </Link>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SidebarAccordion>

                            {/* Brand */}
                            <SidebarAccordion
                                icon={<Building2 size={13} className="text-neutral-500" />}
                                title="Brand"
                            >
                                <BrandFilter brands={brands} />
                            </SidebarAccordion>

                            {/* Size */}
                            <SidebarAccordion
                                icon={<Ruler size={13} className="text-neutral-500" />}
                                title="Size"
                            >
                                <SizeFilter />
                            </SidebarAccordion>

                            {/* Price */}
                            <SidebarAccordion
                                icon={<Banknote size={13} className="text-neutral-500" />}
                                title="Price"
                            >
                                <PriceFilter />
                            </SidebarAccordion>

                            {/* Measurements */}
                            <SidebarAccordion
                                icon={<Ruler size={13} className="text-neutral-500" />}
                                title="Measurements"
                            >
                                <MeasurementFilter />
                            </SidebarAccordion>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ─────────────────────────────── */}
                <div className="min-w-0 flex-1 pl-2 xl:pl-4">
                    {/* Toolbar */}
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Mobile Filter Drawer */}
                            <div className="lg:hidden">
                                <FilterDrawer
                                    genders={genders}
                                    categories={categories}
                                    brands={brands}
                                />
                            </div>

                            {/* View Toggle */}
                            <div className="hidden items-center rounded-xl border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-800 sm:flex">
                                <Button
                                    type="button"
                                    onClick={() => setViewMode("grid")}
                                    variant={viewMode === "grid" ? "primary" : "ghost"}
                                    size="iconSm"
                                    rounded="md"
                                >
                                    <LayoutGrid size={14} />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    variant={viewMode === "list" ? "primary" : "ghost"}
                                    size="iconSm"
                                    rounded="md"
                                >
                                    <List size={14} />
                                </Button>
                            </div>

                            {/* Active filter chips */}
                            {hasActiveFilters && (
                                <div className="hidden items-center gap-1.5 sm:flex">
                                    {initialBrand && (
                                        <Link
                                            href={`${baseUrl}?${new URLSearchParams(
                                                Object.fromEntries(
                                                    Array.from(searchParams.entries()).filter(
                                                        ([k]) => k !== "brand"
                                                    )
                                                )
                                            ).toString()}`}
                                            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                        >
                                            {initialBrand} <span className="ml-0.5 text-neutral-400">×</span>
                                        </Link>
                                    )}
                                    {initialSize && (
                                        <Link
                                            href={`${baseUrl}?${new URLSearchParams(
                                                Object.fromEntries(
                                                    Array.from(searchParams.entries()).filter(
                                                        ([k]) => k !== "size"
                                                    )
                                                )
                                            ).toString()}`}
                                            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                        >
                                            Size {initialSize} <span className="ml-0.5 text-neutral-400">×</span>
                                        </Link>
                                    )}
                                    {initialPrice && (
                                        <Link
                                            href={`${baseUrl}?${new URLSearchParams(
                                                Object.fromEntries(
                                                    Array.from(searchParams.entries()).filter(
                                                        ([k]) => k !== "price"
                                                    )
                                                )
                                            ).toString()}`}
                                            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                        >
                                            {initialPrice} <span className="ml-0.5 text-neutral-400">×</span>
                                        </Link>
                                    )}
                                    {initialMeasurement && (
                                        <Link
                                            href={`${baseUrl}?${new URLSearchParams(
                                                Object.fromEntries(
                                                    Array.from(searchParams.entries()).filter(
                                                        ([k]) => k !== "measurement"
                                                    )
                                                )
                                            ).toString()}`}
                                            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                        >
                                            {initialMeasurement
                                                .replace(/^chest-/i, "Chest ")
                                                .replace(/^waist-/i, "Waist ")
                                                .replace(/^length-/i, "Length ")
                                                .replace(/^inseam-/i, "Inseam ")
                                                .replace(/-plus/g, "+")
                                                .replace(/-/g, "–")}
                                            <span className="ml-0.5 text-neutral-400">×</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 text-center">
                                <p className="text-sm font-medium text-neutral-500">
                                    Showing {filteredProducts.length} Products
                                </p>
                            </div>
                            <SortDropdown defaultValue={initialSort} />
                        </div>
                    </div>

                    {/* Product Grid / List */}
                    {filteredProducts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                <AlertCircle size={28} className="text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">No items found</h3>
                            <p className="mt-1.5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                                Try adjusting your filters or check back later for new arrivals.
                            </p>
                            {hasActiveFilters && (
                                <Link
                                    href={baseUrl}
                                    className="mt-6 flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </Link>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            {loading ? (
                                <div
                                    className={
                                        viewMode === "grid"
                                            ? "grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                                            : "flex flex-col gap-5"
                                    }
                                >
                                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                        <ProductCardSkeleton key={i} list={viewMode === "list"} />
                                    ))}
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {viewMode === "grid" ? (
                                        <motion.div
                                            key="grid"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4"
                                        >
                                            {pageProducts.map((product) => (
                                                <ProductCardGrid
                                                    key={product.id}
                                                    id={product.id}
                                                    slug={product.slug}
                                                    brand={product.brand}
                                                    title={product.title}
                                                    price={product.price}
                                                    retailPrice={product.retailPrice}
                                                    image={product.primaryImage || product.images?.[0] || ""}
                                                    category={product.category}
                                                    chest={product.chest}
                                                    waist={product.waist}
                                                    length={product.length}
                                                    onlyOneLeft={false}
                                                />
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-5"
                                        >
                                            {pageProducts.map((product) => (
                                                <ProductCardList
                                                    key={product.id}
                                                    id={product.id}
                                                    slug={product.slug}
                                                    brand={product.brand}
                                                    title={product.title}
                                                    price={product.price}
                                                    retailPrice={product.retailPrice}
                                                    image={product.primaryImage || product.images?.[0] || ""}
                                                    category={product.category}
                                                    chest={product.chest}
                                                    waist={product.waist}
                                                    length={product.length}
                                                    material={product.material}
                                                    description={product.description}
                                                    onlyOneLeft={false}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}

                            {/* Load More Button */}
                            {totalPages > 1 && (
                                <div className="mt-10 flex flex-col items-center gap-3">
                                    {/* Progress bar */}
                                    <div className="flex w-full max-w-xs items-center gap-3">
                                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className="h-full rounded-full bg-neutral-900 transition-all duration-500 dark:bg-neutral-100"
                                                style={{
                                                    width: `${Math.min((itemsLoaded / filteredProducts.length) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="shrink-0 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                                            {Math.min(itemsLoaded, filteredProducts.length)}/{filteredProducts.length}
                                        </span>
                                    </div>

                                    {currentPage < totalPages ? (
                                        <Button
                                            type="button"
                                            onClick={handleLoadMore}
                                            loading={loading}
                                            loadingText="Loading..."
                                            variant="outline"
                                            size="lg"
                                            fullWidth
                                            className="max-w-xs rounded-2xl shadow-sm"
                                        >
                                            <ChevronDown size={16} />
                                            Load More ({filteredProducts.length - itemsLoaded} remaining)
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                                Showing all {filteredProducts.length} items
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                Back to top ↑
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
