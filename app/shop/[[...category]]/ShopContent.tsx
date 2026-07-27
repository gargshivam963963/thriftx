"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutGrid,
    List,
    ChevronDown,
    ChevronRight,
    RotateCcw,
    AlertCircle,
    Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/services/products";
import { Button } from "@/components/ui/button";
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
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchParams]);

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

    const filteredProducts = useMemo(() => {
        if (!initialSearch) return products;
        const q = initialSearch.toLowerCase().trim();
        return products.filter(
            (p) =>
                p.title?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        );
    }, [products, initialSearch]);

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

    const SectionTitle = ({ label }: { label: string }) => (
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
            {label}
        </h3>
    );

    // Build breadcrumb trail
    const breadcrumbs: { label: string; href: string }[] = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
    ];
    if (gender) {
        const genderName = genders.find((g) => g.slug === gender)?.name || gender.charAt(0).toUpperCase() + gender.slice(1);
        breadcrumbs.push({ label: genderName, href: `/shop/${gender}` });
    }
    if (clothingCategory) {
        breadcrumbs.push({ label: categoryTitle, href: `/shop/${gender}/${clothingCategory}` });
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* ── Breadcrumbs ──────────────────────────────── */}
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {breadcrumbs.map((crumb, i) => (
                        <li key={crumb.href} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight size={10} className="text-neutral-300 dark:text-neutral-600" />}
                            {i === breadcrumbs.length - 1 ? (
                                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{crumb.label}</span>
                            ) : (
                                <Link
                                    href={crumb.href}
                                    className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
                                >
                                    {i === 0 && <Home size={10} />}
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* ── SIDEBAR (Desktop) ─────────────────────────────── */}
                <aside className="hidden lg:sticky lg:top-24 lg:flex lg:w-[240px] lg:shrink-0 lg:self-start lg:flex-col lg:gap-5">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-5 shadow-lg shadow-neutral-200/30 backdrop-blur-xl dark:border-neutral-700/60 dark:bg-neutral-900/95 dark:shadow-neutral-950/30 max-h-[calc(100vh-10rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600 dark:[&::-webkit-scrollbar-thumb]:hover:bg-neutral-500">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                <span className="inline-flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-neutral-900 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">≡</span>
                                    Filters
                                </span>
                            </h2>
                            {hasActiveFilters && (
                                <Link href={baseUrl} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-900 dark:hover:text-neutral-200">
                                    <RotateCcw size={11} /> Reset
                                </Link>
                            )}
                        </div>
                        <div className="space-y-5">
                            <div>
                                <SectionTitle label="Category" />
                                <div className="flex flex-col gap-1">
                                    <Link href="/shop" className={`group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${!gender ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}>
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold transition-all ${!gender ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"}`}>★</span>
                                        All Items
                                    </Link>
                                    {genders.map((g) => (
                                        <div key={g.id}>
                                            <Link href={`/shop/${g.slug}`} className={`group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${gender === g.slug && !clothingCategory ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}>
                                                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold transition-all ${gender === g.slug && !clothingCategory ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"}`}>{g.name.charAt(0)}</span>
                                                {g.name}
                                            </Link>
                                            {gender === g.slug && (
                                                <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                                                    {categories.filter((c) => c.gender.toLowerCase() === g.name.toLowerCase()).map((c) => (
                                                        <Link key={c.id} href={`/shop/${g.slug}/${c.slug}`} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${clothingCategory === c.slug ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`}>{c.name}</Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
                                <div><SectionTitle label="Brand" /><BrandFilter brands={brands} /></div>
                                <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
                                <div><SectionTitle label="Size" /><SizeFilter /></div>
                                <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
                                <div><SectionTitle label="Price" /><PriceFilter /></div>
                                <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
                                <div><SectionTitle label="Measurements" /><MeasurementFilter /></div>
                            </div>
                            {hasActiveFilters && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-4 ring-1 ring-emerald-200/60 dark:from-emerald-900/20 dark:to-emerald-900/10 dark:ring-emerald-800/40">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white dark:bg-emerald-500 dark:text-neutral-900">{activeFilterCount}</span>
                                            Active
                                        </span>
                                        <Link href={baseUrl} className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 underline-offset-2 transition hover:text-emerald-700 hover:underline dark:text-emerald-400">Clear all</Link>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ─────────────────────────────── */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
                                            {initialMeasurement} <span className="ml-0.5 text-neutral-400">×</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                                {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                            </span>
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
                                            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4"
                                            : "flex flex-col gap-4"
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
                                            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4"
                                        >
                                            {pageProducts.map((product) => (
                                                <ProductCardGrid
                                                    key={product.id}
                                                    id={product.id}
                                                    brand={product.brand}
                                                    title={product.title}
                                                    price={product.price}
                                                    retailPrice={product.retailPrice}
                                                    image={product.primaryImage || product.images?.[0] || ""}
                                                    category={product.category}
                                                    chest={product.chest}
                                                    waist={product.waist}
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
                                            className="flex flex-col gap-4"
                                        >
                                            {pageProducts.map((product) => (
                                                <ProductCardList
                                                    key={product.id}
                                                    id={product.id}
                                                    brand={product.brand}
                                                    title={product.title}
                                                    price={product.price}
                                                    retailPrice={product.retailPrice}
                                                    image={product.primaryImage || product.images?.[0] || ""}
                                                    category={product.category}
                                                    chest={product.chest}
                                                    waist={product.waist}
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
