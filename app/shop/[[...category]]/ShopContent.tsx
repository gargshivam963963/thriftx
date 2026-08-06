"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    LayoutGrid,
    List,
    ChevronDown,
    RotateCcw,
    AlertCircle,
    Tags,
    Building2,
    Ruler,
    Banknote,
    X,
    Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/services/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/Card";
import ProductCardGrid from "@/components/shop/ProductCardGrid";
import ProductCardList from "@/components/shop/ProductCardList";
import ProductCardSkeleton from "@/components/shop/ProductCardSkeleton";
import BrandFilter from "@/components/shop/BrandFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import PriceFilter from "@/components/shop/PriceFilter";
import MeasurementFilter from "@/components/shop/MeasurementFilter";
import FilterDrawer from "@/components/shop/FilterDrawer";
import SortDropdown from "@/components/shop/SortDropdown";

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

// ─── Accordion Section (shadcn-like using Card) ─────────────────────────────

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
        <Card className="overflow-hidden border-border">
            <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-body-sm font-semibold text-foreground transition hover:bg-muted"
                onClick={() => setOpen(!open)}
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
        </Card>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ShopContent({
    products: initialProducts,
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
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(ITEMS_PER_PAGE);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(initialProducts.length);

    const baseUrl = gender
        ? `/shop/${gender}${clothingCategory ? `/${clothingCategory}` : ""}`
        : "/shop";

    const hasActiveFilters =
        initialBrand || initialSize || initialPrice || initialMeasurement || initialSearch;

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

    useEffect(() => {
        setOffset(ITEMS_PER_PAGE);
        setHasMore(true);
        setProducts(initialProducts);
        setTotalCount(initialProducts.length);
    }, [initialProducts, searchParams]);

    // ── Load More Handler ──
    const handleLoadMore = useCallback(async () => {
        setLoadingMore(true);
        try {
            const params = new URLSearchParams();
            if (gender) params.set("gender", gender);
            if (clothingCategory) params.set("category", clothingCategory);
            if (initialBrand) params.set("brand", initialBrand);
            if (initialSize) params.set("size", initialSize);
            if (initialPrice) params.set("price", initialPrice);
            if (initialMeasurement) params.set("measurement", initialMeasurement);
            if (initialSearch) params.set("search", initialSearch);
            params.set("sort", initialSort);
            params.set("limit", String(ITEMS_PER_PAGE));
            params.set("offset", String(offset));

            const res = await fetch(`/api/shop/products?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setProducts((prev) => [...prev, ...data.products]);
                setOffset((prev) => prev + ITEMS_PER_PAGE);
                setHasMore(data.hasMore);
                setTotalCount((prev) => prev + data.products.length);
            }
        } catch (err) {
            console.error("Failed to load more products:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [offset, gender, clothingCategory, initialBrand, initialSize, initialPrice, initialMeasurement, initialSearch, initialSort]);

    // Client-side measurement & search filter for initial products
    const filteredProducts = useMemo(() => {
        let results = products;

        if (initialSearch) {
            const q = initialSearch.toLowerCase().trim();
            results = results.filter(
                (p) =>
                    p.title?.toLowerCase().includes(q) ||
                    p.brand?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
            );
        }

        if (parsedMeasurement) {
            const { type, value } = parsedMeasurement;
            results = results.filter((p) => {
                const fieldValue = p[type];
                if (!fieldValue) return false;
                const numVal = parseInt(fieldValue.toString().replace(/[^\d]/g, ""), 10);
                if (isNaN(numVal)) return false;
                if (initialMeasurement?.endsWith("-plus")) {
                    return numVal >= value;
                }
                return Math.abs(numVal - value) <= 2;
            });
        }

        return results;
    }, [products, initialSearch, parsedMeasurement, initialMeasurement]);

    return (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
                {/* ── SIDEBAR (Desktop) ─────────────────────────────── */}
                <aside className="hidden lg:sticky lg:top-24 lg:flex lg:w-[260px] xl:w-[280px] lg:shrink-0 lg:self-start lg:flex-col lg:gap-5">
                    <div className="space-y-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-heading-3 font-bold text-foreground">Filters</h2>
                            {hasActiveFilters && (
                                <Link
                                    href={baseUrl}
                                    className="flex items-center gap-1 text-badge font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
                                >
                                    <RotateCcw size={11} /> Reset
                                </Link>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Category - default open */}
                            <SidebarAccordion
                                icon={<Tags size={13} className="text-muted-foreground" />}
                                title="Category"
                                defaultOpen={true}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <Link
                                        href="/shop"
                                        className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-body-sm font-medium transition-all ${!gender ? "bg-foreground text-background shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                                    >
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-md text-badge font-bold ${!gender ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`}>
                                            <Star size={9} />
                                        </span>
                                        All Items
                                    </Link>
                                    {genders.map((g) => (
                                        <div key={g.id}>
                                            <Link
                                                href={`/shop/${g.slug}`}
                                                className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-body-sm font-medium transition-all ${gender === g.slug && !clothingCategory ? "bg-foreground text-background shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                                            >
                                                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-badge font-bold ${gender === g.slug && !clothingCategory ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`}>
                                                    {g.name.charAt(0)}
                                                </span>
                                                {g.name}
                                            </Link>
                                            {gender === g.slug && (
                                                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                                                    {categories
                                                        .filter((c) => c.gender.toLowerCase() === g.name.toLowerCase())
                                                        .map((c) => (
                                                            <Link
                                                                key={c.id}
                                                                href={`/shop/${g.slug}/${c.slug}`}
                                                                className={`rounded-lg px-3 py-1.5 text-body-sm font-medium transition-all ${clothingCategory === c.slug ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
                                icon={<Building2 size={13} className="text-muted-foreground" />}
                                title="Brand"
                            >
                                <BrandFilter brands={brands} />
                            </SidebarAccordion>

                            {/* Size */}
                            <SidebarAccordion
                                icon={<Ruler size={13} className="text-muted-foreground" />}
                                title="Size"
                            >
                                <SizeFilter />
                            </SidebarAccordion>

                            {/* Price */}
                            <SidebarAccordion
                                icon={<Banknote size={13} className="text-muted-foreground" />}
                                title="Price"
                            >
                                <PriceFilter />
                            </SidebarAccordion>

                            {/* Measurements */}
                            <SidebarAccordion
                                icon={<Ruler size={13} className="text-muted-foreground" />}
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
                            <div className="hidden items-center rounded-xl border border-border bg-card p-0.5 sm:flex">
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

                            {/* Active filter chips - using shadcn Badge */}
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
                                        >
                                            <Badge variant="secondary" size="sm" rounded="full" className="cursor-pointer hover:bg-muted">
                                                {initialBrand}
                                                <X size={10} className="ml-1" />
                                            </Badge>
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
                                        >
                                            <Badge variant="secondary" size="sm" rounded="full" className="cursor-pointer hover:bg-muted">
                                                Size {initialSize}
                                                <X size={10} className="ml-1" />
                                            </Badge>
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
                                        >
                                            <Badge variant="secondary" size="sm" rounded="full" className="cursor-pointer hover:bg-muted">
                                                {initialPrice}
                                                <X size={10} className="ml-1" />
                                            </Badge>
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
                                        >
                                            <Badge variant="secondary" size="sm" rounded="full" className="cursor-pointer hover:bg-muted">
                                                {initialMeasurement
                                                    .replace(/^chest-/i, "Chest ")
                                                    .replace(/^waist-/i, "Waist ")
                                                    .replace(/^length-/i, "Length ")
                                                    .replace(/^inseam-/i, "Inseam ")
                                                    .replace(/-plus/g, "+")
                                                    .replace(/-/g, "–")}
                                                <X size={10} className="ml-1" />
                                            </Badge>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 text-center">
                                <p className="text-body-sm font-medium text-muted-foreground">
                                    Showing {filteredProducts.length} Products
                                </p>
                            </div>
                            <SortDropdown defaultValue={initialSort} />
                        </div>
                    </div>

                    {/* Product Grid / List */}
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
                    ) : filteredProducts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <AlertCircle size={28} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-heading-4 font-bold text-foreground">No items found</h3>
                            <p className="mt-1.5 max-w-sm text-body-sm text-muted-foreground">
                                Try adjusting your filters or check back later for new arrivals.
                            </p>
                            {hasActiveFilters && (
                                <Link
                                    href={baseUrl}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-body-sm font-semibold text-background transition hover:opacity-90"
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </Link>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            {viewMode === "grid" ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4"
                                >
                                    {filteredProducts.map((product) => (
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
                                    className="flex flex-col gap-5"
                                >
                                    {filteredProducts.map((product) => (
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

                            {/* Load More / Pagination - using shadcn Progress and Button */}
                            {hasMore && (
                                <div className="mt-10 flex flex-col items-center gap-3">
                                    {/* Progress bar - shadcn Progress component */}
                                    <div className="flex w-full max-w-xs items-center gap-3">
                                        <Progress
                                            value={Math.min((filteredProducts.length / (totalCount || filteredProducts.length + ITEMS_PER_PAGE)) * 100, 100)}
                                            className="h-1 bg-muted"
                                        />
                                        <span className="shrink-0 text-badge font-semibold text-muted-foreground">
                                            {filteredProducts.length}+
                                        </span>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleLoadMore}
                                        loading={loadingMore}
                                        loadingText="Loading..."
                                        variant="outline"
                                        size="lg"
                                        rounded="xl"
                                        fullWidth
                                        className="max-w-xs shadow-sm"
                                    >
                                        <ChevronDown size={16} />
                                        Load More
                                    </Button>
                                </div>
                            )}

                            {!hasMore && filteredProducts.length > 0 && (
                                <div className="mt-10 flex flex-col items-center gap-2">
                                    <Badge variant="secondary" size="md" rounded="full">
                                        Showing all {filteredProducts.length} items
                                    </Badge>
                                    <Button
                                        type="button"
                                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                        variant="ghost"
                                        size="sm"
                                        rounded="lg"
                                        className="mt-2"
                                    >
                                        Back to top ↑
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

