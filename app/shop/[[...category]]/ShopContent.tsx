"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
    Palette,
    Layers,
    BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Product } from "@/lib/services/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FilterAccordion from "@/components/ui/FilterAccordion";
import FilterChip from "@/components/ui/FilterChip";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ToolbarSearch from "@/components/ui/ToolbarSearch";
import ProductCardGrid from "@/components/shop/ProductCardGrid";
import ProductCardList from "@/components/shop/ProductCardList";
import ProductCardSkeleton from "@/components/shop/ProductCardSkeleton";
import BrandFilter from "@/components/shop/BrandFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import PriceFilter from "@/components/shop/PriceFilter";
import MeasurementFilter from "@/components/shop/MeasurementFilter";
import ColorFilter from "@/components/shop/ColorFilter";
import MaterialFilter from "@/components/shop/MaterialFilter";
import ConditionFilter from "@/components/shop/ConditionFilter";
import FilterDrawer from "@/components/shop/FilterDrawer";
import SortDropdown from "@/components/shop/SortDropdown";
import { useShopFacets } from "@/hooks/useShopFacets";

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
    products: initialProducts,
    genders,
    categories,
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
    const [searchInput, setSearchInput] = useState(initialSearch ?? "");
    const loaderRef = useRef<HTMLDivElement>(null);

    const baseUrl = gender
        ? `/shop/${gender}${clothingCategory ? `/${clothingCategory}` : ""}`
        : "/shop";

    const facets = useShopFacets(products);

    const activeFilters = useMemo(() => {
        const count = [
            initialBrand,
            initialSize,
            initialPrice,
            initialMeasurement,
            searchParams.get("color"),
            searchParams.get("material"),
            searchParams.get("condition"),
        ].filter(Boolean).length;
        return count;
    }, [initialBrand, initialSize, initialPrice, initialMeasurement, searchParams]);

    const hasActiveFilters = activeFilters > 0;

    // Sync products when the route (filters) change from the server page.
    useEffect(() => {
        setProducts(initialProducts);
        setOffset(ITEMS_PER_PAGE);
        setHasMore(initialProducts.length >= ITEMS_PER_PAGE);
        setTotalCount(initialProducts.length);
    }, [initialProducts, searchParams]);

    // ── Instant search with debounce (client-side for accuracy) ──
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const q = searchInput.trim().toLowerCase();
            if (q) {
                const filtered = products.filter(
                    (p) =>
                        p.title?.toLowerCase().includes(q) ||
                        p.brand?.toLowerCase().includes(q) ||
                        p.description?.toLowerCase().includes(q)
                );
                setProducts(filtered);
            } else {
                setProducts(initialProducts);
            }
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput, initialProducts]);

    // ── Load More with infinite scroll ──
    const handleLoadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", initialSort);
            params.set("limit", String(ITEMS_PER_PAGE));
            params.set("offset", String(offset));

            const res = await fetch(`/api/shop/products?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setProducts((prev) => {
                    const existing = new Set(prev.map((p) => p.id));
                    const next = [
                        ...prev,
                        ...data.products.filter((p: Product) => !existing.has(p.id)),
                    ];
                    return next;
                });
                setOffset((prev) => prev + ITEMS_PER_PAGE);
                setHasMore(data.hasMore);
                setTotalCount((prev) => prev + data.products.length);
            }
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    }, [offset, loadingMore, hasMore, initialSort, searchParams]);

    // Intersection observer for infinite scroll.
    useEffect(() => {
        const el = loaderRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            { rootMargin: "300px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    // ── Filter chip removal helpers ──
    function removeParam(key: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        const qs = params.toString();
        routerPusher(qs);
    }

    function routerPusher(qs: string) {
        const url = qs ? `${baseUrl}?${qs}` : baseUrl;
        window.location.href = url;
    }

    const gridClasses =
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="mb-8 flex flex-col gap-2">
                <nav className="text-badge font-semibold uppercase tracking-widest text-muted-foreground">
                    <Link href="/" className="transition-colors hover:text-foreground">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">Shop</span>
                    {categoryTitle !== "All Items" && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="text-foreground">{categoryTitle}</span>
                        </>
                    )}
                </nav>
                <h1 className="text-heading-2 font-bold tracking-tight text-foreground">
                    {categoryTitle}
                </h1>
                <p className="text-body text-muted-foreground">
                    {totalCount} products — authentic, quality-checked thrift fashion.
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                {/* ── SIDEBAR (Desktop) ─────────────────────────────────── */}
                <aside className="hidden lg:sticky lg:top-24 lg:flex lg:w-[264px] lg:shrink-0 lg:self-start lg:flex-col lg:gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
                        {hasActiveFilters && (
                            <Link
                                href={baseUrl}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-card"
                            >
                                <RotateCcw size={14} className="h-4 w-4" />
                                Reset
                            </Link>
                        )}
                    </div>

                    <div className="space-y-3">
                        <FilterAccordion
                            icon={<Tags size={16} />}
                            title="Category"
                            defaultOpen
                        >
                            <div className="flex flex-col gap-0.5">
                                <Link
                                    href="/shop"
                                    className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${!gender
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card"
                                        }`}
                                >
                                    All Items
                                </Link>
                                {genders.map((g) => (
                                    <div key={g.id}>
                                        <Link
                                            href={`/shop/${g.slug}`}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${gender === g.slug && !clothingCategory
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card"
                                                }`}
                                        >
                                            {g.name}
                                        </Link>
                                        {gender === g.slug && (
                                            <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                                                {categories
                                                    .filter(
                                                        (c) =>
                                                            c.gender.toLowerCase() === g.name.toLowerCase()
                                                    )
                                                    .map((c) => (
                                                        <Link
                                                            key={c.id}
                                                            href={`/shop/${g.slug}/${c.slug}`}
                                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${clothingCategory === c.slug
                                                                ? "bg-muted text-foreground"
                                                                : "text-muted-foreground hover:text-foreground"
                                                                }`}
                                                        >
                                                            {c.name}
                                                        </Link>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
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

                        <FilterAccordion icon={<BadgeCheck size={16} />} title="Condition">
                            <ConditionFilter conditions={facets.conditions} />
                        </FilterAccordion>

                        <FilterAccordion icon={<Ruler size={16} />} title="Measurements">
                            <MeasurementFilter />
                        </FilterAccordion>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ─────────────────────────────────────── */}
                <div className="min-w-0 flex-1">
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col gap-4">
                        {/* Search + controls row */}
                        <div className="flex items-center gap-3">
                            {/* Mobile Filter Drawer */}
                            <div className="lg:hidden">
                                <FilterDrawer
                                    genders={genders}
                                    categories={categories}
                                    facets={facets}
                                />
                            </div>

                            {/* View Toggle — segmented control */}
                            <SegmentedControl
                                value={viewMode}
                                onChange={setViewMode}
                                options={[
                                    {
                                        value: "grid",
                                        ariaLabel: "Grid view",
                                        icon: <LayoutGrid size={16} />,
                                    },
                                    {
                                        value: "list",
                                        ariaLabel: "List view",
                                        icon: <List size={16} />,
                                    },
                                ]}
                                className="hidden sm:inline-flex"
                            />

                            {/* Instant search */}
                            <ToolbarSearch
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Search products, brands…"
                                ariaLabel="Search products"
                            />

                            <SortDropdown defaultValue={initialSort} />
                        </div>

                        {/* Active filter chips */}
                        <AnimatePresence>
                            {(hasActiveFilters || searchInput) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap items-center gap-2"
                                >
                                    {initialBrand && (
                                        <FilterChip
                                            label={initialBrand}
                                            onRemove={() => removeParam("brand")}
                                        />
                                    )}
                                    {initialSize && (
                                        <FilterChip
                                            label={`Size ${initialSize}`}
                                            onRemove={() => removeParam("size")}
                                        />
                                    )}
                                    {initialPrice && (
                                        <FilterChip
                                            label={priceLabel(initialPrice)}
                                            onRemove={() => removeParam("price")}
                                        />
                                    )}
                                    {initialMeasurement && (
                                        <FilterChip
                                            label={measurementLabel(initialMeasurement)}
                                            onRemove={() => removeParam("measurement")}
                                        />
                                    )}
                                    {searchParams.get("color") && (
                                        <FilterChip
                                            label={searchParams.get("color")!}
                                            onRemove={() => removeParam("color")}
                                        />
                                    )}
                                    {searchParams.get("material") && (
                                        <FilterChip
                                            label={searchParams.get("material")!}
                                            onRemove={() => removeParam("material")}
                                        />
                                    )}
                                    {searchParams.get("condition") && (
                                        <FilterChip
                                            label={searchParams.get("condition")!}
                                            onRemove={() => removeParam("condition")}
                                        />
                                    )}
                                    {searchInput && (
                                        <FilterChip
                                            label={`"${searchInput}"`}
                                            onRemove={() => setSearchInput("")}
                                        />
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchInput("");
                                            window.location.href = baseUrl;
                                        }}
                                        className="h-8 rounded-full text-sm font-medium normal-case tracking-normal"
                                    >
                                        <RotateCcw size={14} className="h-4 w-4" />
                                        Clear all
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Summary line */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-body-sm font-medium text-muted-foreground">
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {products.length}
                            </span>{" "}
                            {products.length === 1 ? "product" : "products"}
                        </p>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div
                            className={
                                viewMode === "grid" ? gridClasses : "flex flex-col gap-5"
                            }
                        >
                            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                <ProductCardSkeleton key={i} list={viewMode === "list"} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <AlertCircle size={28} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-heading-4 font-bold text-foreground">
                                No items found
                            </h3>
                            <p className="mt-1.5 max-w-sm text-body-sm text-muted-foreground">
                                Try adjusting your filters or check back later for new arrivals.
                            </p>
                            <Link
                                href={baseUrl}
                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-all hover:opacity-90 dark:bg-foreground dark:text-background"
                            >
                                <RotateCcw size={14} className="h-4 w-4" />
                                Reset Filters
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {viewMode === "grid" ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={gridClasses}
                                >
                                    {products.map((product) => (
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
                                    {products.map((product) => (
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

                            {/* Infinite scroll loader */}
                            {hasMore && products.length >= ITEMS_PER_PAGE && (
                                <div
                                    ref={loaderRef}
                                    className="mt-10 flex flex-col items-center gap-3"
                                >
                                    <div className="flex w-full max-w-xs items-center gap-3">
                                        <Progress
                                            value={Math.min(
                                                (products.length /
                                                    (totalCount || products.length + ITEMS_PER_PAGE)) *
                                                100,
                                                100
                                            )}
                                            className="h-1 bg-muted"
                                        />
                                        <span className="shrink-0 text-badge font-semibold text-muted-foreground">
                                            {products.length}+
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleLoadMore}
                                        loading={loadingMore}
                                        loadingText="Loading…"
                                        variant="outline"
                                        size="lg"
                                        rounded="xl"
                                        className="max-w-xs shadow-sm"
                                    >
                                        <ChevronDown size={16} />
                                        Load More
                                    </Button>
                                </div>
                            )}

                            {!hasMore && products.length > 0 && (
                                <div className="mt-10 flex flex-col items-center gap-2">
                                    <Badge variant="secondary" size="md" rounded="full">
                                        Showing all {products.length} items
                                    </Badge>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }
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

// ── Label helpers ────────────────────────────────────────────────────────

function priceLabel(value: string): string {
    const map: Record<string, string> = {
        "0-499": "Under ₹499",
        "500-999": "₹500 – ₹999",
        "1000-1499": "₹1000 – ₹1499",
        "1500+": "₹1500+",
    };
    return map[value] ?? value;
}

function measurementLabel(value: string): string {
    return value
        .replace(/^chest-/i, "Chest ")
        .replace(/^waist-/i, "Waist ")
        .replace(/^length-/i, "Length ")
        .replace(/^inseam-/i, "Inseam ")
        .replace(/-plus/g, "+")
        .replace(/-/g, "–");
}