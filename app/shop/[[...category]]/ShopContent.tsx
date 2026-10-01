"use client";

import {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
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
    RefreshCw,
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
    genders: {
        id: string;
        slug: string;
        name: string;
    }[];
    categories: {
        id: string;
        slug: string;
        name: string;
        gender: string;
    }[];
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

const GRID_CLASSES =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 md:gap-x-6 md:gap-y-10 xl:gap-x-7 xl:gap-y-11 2xl:grid-cols-4";

const LIST_CLASSES =
    "flex flex-col gap-4 sm:gap-5";

function ProductGridSkeleton({
    list,
}: {
    list: boolean;
}) {
    return (
        <div
            className={
                list
                    ? LIST_CLASSES
                    : GRID_CLASSES
            }
        >
            {Array.from({
                length: ITEMS_PER_PAGE,
            }).map((_, index) => (
                <ProductCardSkeleton
                    key={index}
                    list={list}
                />
            ))}
        </div>
    );
}

function ProductImageFallback() {
    return (
        <div
            className="
                flex
                aspect-[4/5]
                w-full
                items-center
                justify-center
                bg-muted
                text-muted-foreground
            "
        >
            <div className="flex flex-col items-center gap-2">
                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-border
                        bg-background
                    "
                >
                    <AlertCircle className="h-4 w-4" />
                </div>

                <span className="text-xs">
                    Image unavailable
                </span>
            </div>
        </div>
    );
}

function ErrorState({
    onRetry,
}: {
    onRetry: () => void;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="
                flex
                min-h-[320px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-destructive/20
                bg-destructive/[0.03]
                px-5
                py-12
                text-center
                sm:min-h-[360px]
            "
        >
            <div
                className="
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-destructive/10
                    text-destructive
                    sm:h-14
                    sm:w-14
                "
            >
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <h2
                className="
                    text-lg
                    font-semibold
                    leading-6
                    tracking-[-0.01em]
                    text-foreground
                "
            >
                Couldn&apos;t load products
            </h2>

            <p
                className="
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-muted-foreground
                "
            >
                Something went wrong while
                loading this collection.
                Please try again.
            </p>

            <Button
                type="button"
                variant="outline"
                size="md"
                rounded="xl"
                onClick={onRetry}
                className="mt-5 min-h-11"
            >
                <RefreshCw className="h-4 w-4" />
                Try Again
            </Button>
        </motion.div>
    );
}

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

    const [viewMode, setViewMode] =
        useState<"grid" | "list">("grid");

    const [products, setProducts] =
        useState<Product[]>(
            initialProducts,
        );

    const [loading, setLoading] =
        useState(false);

    const [loadingMore, setLoadingMore] =
        useState(false);

    const [loadMoreError, setLoadMoreError] =
        useState(false);

    const [initialLoadError, setInitialLoadError] =
        useState(false);

    const [offset, setOffset] =
        useState(ITEMS_PER_PAGE);

    const [hasMore, setHasMore] =
        useState(
            initialProducts.length >=
            ITEMS_PER_PAGE,
        );

    const [totalCount, setTotalCount] =
        useState(
            initialProducts.length,
        );

    const [searchInput, setSearchInput] =
        useState(
            initialSearch ?? "",
        );

    const baseUrl = gender
        ? `/shop/${gender}${clothingCategory
            ? `/${clothingCategory}`
            : ""
        }`
        : "/shop";

    const facets =
        useShopFacets(
            initialProducts,
        );

    /*
     * ---------------------------------------------------------
     * Active filters
     * ---------------------------------------------------------
     */

    const activeFilters =
        useMemo(() => {
            return [
                initialBrand,
                initialSize,
                initialPrice,
                initialMeasurement,
                searchParams.get(
                    "color",
                ),
                searchParams.get(
                    "material",
                ),
                searchParams.get(
                    "condition",
                ),
            ].filter(Boolean).length;
        }, [
            initialBrand,
            initialSize,
            initialPrice,
            initialMeasurement,
            searchParams,
        ]);

    const hasActiveFilters =
        activeFilters > 0;

    /*
     * ---------------------------------------------------------
     * Category navigation
     * ---------------------------------------------------------
     */

    const categoryItems =
        useMemo(
            () =>
                genders.map(
                    (item) => ({
                        ...item,
                        categories:
                            categories.filter(
                                (
                                    itemCategory,
                                ) =>
                                    itemCategory.gender.toLowerCase() ===
                                    item.name.toLowerCase(),
                            ),
                    }),
                ),
            [
                genders,
                categories,
            ],
        );

    /*
     * ---------------------------------------------------------
     * Sync server products when route changes
     * ---------------------------------------------------------
     */

    useEffect(() => {
        setProducts(
            initialProducts,
        );

        setOffset(
            ITEMS_PER_PAGE,
        );

        setHasMore(
            initialProducts.length >=
            ITEMS_PER_PAGE,
        );

        setTotalCount(
            initialProducts.length,
        );

        setSearchInput(
            initialSearch ?? "",
        );

        setLoadMoreError(false);
        setInitialLoadError(false);
    }, [
        initialProducts,
        searchParams,
        initialSearch,
    ]);

    /*
     * ---------------------------------------------------------
     * Search
     * ---------------------------------------------------------
     */

    const debounceRef =
        useRef<
            ReturnType<
                typeof setTimeout
            > | null
        >(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(
                debounceRef.current,
            );
        }

        debounceRef.current =
            setTimeout(() => {
                const query =
                    searchInput
                        .trim()
                        .toLowerCase();

                if (!query) {
                    setProducts(
                        initialProducts,
                    );
                    return;
                }

                const filtered =
                    initialProducts.filter(
                        (product) => {
                            const searchableText =
                                [
                                    product.title,
                                    product.brand,
                                    product.description,
                                    product.category,
                                    product.material,
                                    product.color,
                                    product.size,
                                ]
                                    .filter(
                                        Boolean,
                                    )
                                    .join(
                                        " ",
                                    )
                                    .toLowerCase();

                            return searchableText.includes(
                                query,
                            );
                        },
                    );

                setProducts(
                    filtered,
                );
            }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(
                    debounceRef.current,
                );
            }
        };
    }, [
        searchInput,
        initialProducts,
    ]);

    /*
     * ---------------------------------------------------------
     * Load more
     * ---------------------------------------------------------
     */

    const handleLoadMore =
        useCallback(async () => {
            if (
                loadingMore ||
                !hasMore
            ) {
                return;
            }

            setLoadingMore(true);
            setLoadMoreError(false);

            try {
                const params =
                    new URLSearchParams(
                        searchParams.toString(),
                    );

                params.set(
                    "sort",
                    initialSort,
                );

                params.set(
                    "limit",
                    String(
                        ITEMS_PER_PAGE,
                    ),
                );

                params.set(
                    "offset",
                    String(offset),
                );

                const response =
                    await fetch(
                        `/api/shop/products?${params.toString()}`,
                        {
                            method: "GET",
                            cache: "no-store",
                        },
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load products",
                    );
                }

                const data =
                    await response.json();

                if (!data.success) {
                    throw new Error(
                        data.error ??
                        "Failed to load products",
                    );
                }

                const incomingProducts =
                    Array.isArray(
                        data.products,
                    )
                        ? data.products
                        : [];

                setProducts(
                    (previous) => {
                        const existingIds =
                            new Set(
                                previous.map(
                                    (
                                        product,
                                    ) =>
                                        product.id,
                                ),
                            );

                        const nextProducts =
                            incomingProducts.filter(
                                (
                                    product: Product,
                                ) =>
                                    !existingIds.has(
                                        product.id,
                                    ),
                            );

                        return [
                            ...previous,
                            ...nextProducts,
                        ];
                    },
                );

                setOffset(
                    (previous) =>
                        previous +
                        ITEMS_PER_PAGE,
                );

                setHasMore(
                    Boolean(
                        data.hasMore,
                    ),
                );

                if (
                    typeof data.total ===
                    "number"
                ) {
                    setTotalCount(
                        data.total,
                    );
                } else {
                    setTotalCount(
                        (previous) =>
                            Math.max(
                                previous,
                                products.length +
                                incomingProducts.length,
                            ),
                    );
                }
            } catch {
                setLoadMoreError(true);
            } finally {
                setLoadingMore(false);
            }
        }, [
            offset,
            loadingMore,
            hasMore,
            initialSort,
            searchParams,
            products.length,
        ]);

    /*
     * ---------------------------------------------------------
     * Retry
     * ---------------------------------------------------------
     */

    const handleRetry =
        useCallback(() => {
            setInitialLoadError(false);
            setLoading(true);

            window.setTimeout(() => {
                window.location.reload();
            }, 150);
        }, []);

    /*
     * ---------------------------------------------------------
     * URL helpers
     * ---------------------------------------------------------
     */

    function routerPusher(
        queryString: string,
    ) {
        const url = queryString
            ? `${baseUrl}?${queryString}`
            : baseUrl;

        window.location.href =
            url;
    }

    function removeParam(
        key: string,
    ) {
        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.delete(key);

        routerPusher(
            params.toString(),
        );
    }

    /*
     * ---------------------------------------------------------
     * Result state
     * ---------------------------------------------------------
     */

    const visibleCount =
        products.length;

    const progressValue =
        totalCount > 0
            ? Math.min(
                (visibleCount /
                    totalCount) *
                100,
                100,
            )
            : 0;

    const isSearchActive =
        Boolean(
            searchInput.trim(),
        );

    /*
     * ---------------------------------------------------------
     * Render
     * ---------------------------------------------------------
     */

    return (
        <main className="min-w-0 w-full overflow-x-hidden bg-background text-foreground">
            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1440px]
                    px-4
                    py-5
                    sm:px-6
                    sm:py-7
                    lg:px-8
                    lg:py-9
                    xl:px-10
                "
            >
                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}

                <header
                    className="
                        mb-6
                        sm:mb-8
                        lg:mb-10
                    "
                >
                    <nav
                        aria-label="Breadcrumb"
                        className="
                            flex
                            min-w-0
                            flex-wrap
                            items-center
                            gap-x-2
                            gap-y-1
                            text-[11px]
                            font-medium
                            uppercase
                            tracking-[0.08em]
                            text-muted-foreground
                            sm:text-xs
                        "
                    >
                        <Link
                            href="/"
                            className="
                                inline-flex
                                min-h-8
                                items-center
                                transition-colors
                                hover:text-foreground
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ring
                            "
                        >
                            Home
                        </Link>

                        <span
                            aria-hidden="true"
                            className="text-muted-foreground/50"
                        >
                            /
                        </span>

                        <Link
                            href="/shop"
                            className="
                                inline-flex
                                min-h-8
                                items-center
                                transition-colors
                                hover:text-foreground
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ring
                            "
                        >
                            Shop
                        </Link>

                        {categoryTitle !==
                            "All Items" && (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="text-muted-foreground/50"
                                    >
                                        /
                                    </span>

                                    <span className="inline-flex min-h-8 items-center text-foreground">
                                        {
                                            categoryTitle
                                        }
                                    </span>
                                </>
                            )}
                    </nav>

                    <div
                        className="
                            mt-3
                            max-w-3xl
                            sm:mt-4
                        "
                    >
                        <h1
                            className="
                                text-[clamp(1.875rem,4vw,2.75rem)]
                                font-semibold
                                leading-[1.06]
                                tracking-[-0.035em]
                                text-foreground
                            "
                        >
                            {categoryTitle}
                        </h1>

                        <p
                            className="
                                mt-2
                                max-w-2xl
                                text-[13px]
                                leading-5
                                text-muted-foreground
                                sm:mt-2.5
                                sm:text-sm
                                sm:leading-6
                            "
                        >
                            Explore our curated
                            collection and find
                            pieces that match
                            your style.
                        </p>
                    </div>
                </header>

                {/* =====================================================
                    MAIN LAYOUT
                ====================================================== */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-start
                        lg:gap-8
                        xl:gap-10
                    "
                >
                    {/* =================================================
                        DESKTOP FILTER SIDEBAR
                    ================================================== */}

                    <aside
                        className="
                            hidden
                            w-[232px]
                            shrink-0
                            lg:sticky
                            lg:top-24
                            lg:flex
                            lg:flex-col
                            lg:gap-4
                            xl:w-[248px]
                        "
                        aria-label="Product filters"
                    >
                        <div
                            className="
                                flex
                                min-h-11
                                items-center
                                justify-between
                            "
                        >
                            <div>
                                <h2
                                    className="
                                        text-base
                                        font-semibold
                                        leading-6
                                        tracking-[-0.01em]
                                        text-foreground
                                    "
                                >
                                    Filters
                                </h2>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        leading-5
                                        text-muted-foreground
                                    "
                                >
                                    Refine your
                                    selection
                                </p>
                            </div>

                            {hasActiveFilters && (
                                <Link
                                    href={baseUrl}
                                    className="
                                        inline-flex
                                        min-h-9
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        px-2.5
                                        text-xs
                                        font-medium
                                        text-muted-foreground
                                        transition-colors
                                        hover:bg-muted
                                        hover:text-foreground
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-ring
                                    "
                                >
                                    <RotateCcw
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Reset
                                </Link>
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* Category */}
                            <FilterAccordion
                                icon={
                                    <Tags
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Category"
                                defaultOpen
                            >
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href="/shop"
                                        className={`
                                            flex
                                            min-h-10
                                            items-center
                                            rounded-lg
                                            px-3
                                            text-sm
                                            font-medium
                                            leading-5
                                            transition-colors
                                            focus-visible:outline-none
                                            focus-visible:ring-2
                                            focus-visible:ring-ring
                                            ${!gender
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }
                                        `}
                                    >
                                        All Items
                                    </Link>

                                    {categoryItems.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                            >
                                                <Link
                                                    href={`/shop/${item.slug}`}
                                                    className={`
                                                        flex
                                                        min-h-10
                                                        items-center
                                                        rounded-lg
                                                        px-3
                                                        text-sm
                                                        font-medium
                                                        leading-5
                                                        transition-colors
                                                        focus-visible:outline-none
                                                        focus-visible:ring-2
                                                        focus-visible:ring-ring
                                                        ${gender ===
                                                            item.slug &&
                                                            !clothingCategory
                                                            ? "bg-foreground text-background"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        }
                                                    `}
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </Link>

                                                {gender ===
                                                    item.slug &&
                                                    item
                                                        .categories
                                                        .length >
                                                    0 && (
                                                        <div
                                                            className="
                                                                ml-3
                                                                mt-1
                                                                flex
                                                                flex-col
                                                                gap-0.5
                                                                border-l
                                                                border-border
                                                                pl-3
                                                            "
                                                        >
                                                            {item.categories.map(
                                                                (
                                                                    itemCategory,
                                                                ) => (
                                                                    <Link
                                                                        key={
                                                                            itemCategory.id
                                                                        }
                                                                        href={`/shop/${item.slug}/${itemCategory.slug}`}
                                                                        className={`
                                                                            flex
                                                                            min-h-9
                                                                            items-center
                                                                            rounded-lg
                                                                            px-3
                                                                            text-xs
                                                                            font-medium
                                                                            leading-5
                                                                            transition-colors
                                                                            focus-visible:outline-none
                                                                            focus-visible:ring-2
                                                                            focus-visible:ring-ring
                                                                            ${clothingCategory ===
                                                                                itemCategory.slug
                                                                                ? "bg-muted text-foreground"
                                                                                : "text-muted-foreground hover:text-foreground"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            itemCategory.name
                                                                        }
                                                                    </Link>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </FilterAccordion>

                            {/* Brand */}
                            <FilterAccordion
                                icon={
                                    <Building2
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Brand"
                            >
                                <BrandFilter
                                    brands={
                                        facets.brands
                                    }
                                />
                            </FilterAccordion>

                            {/* Size */}
                            <FilterAccordion
                                icon={
                                    <Ruler
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Size"
                            >
                                <SizeFilter
                                    sizes={
                                        facets.sizes
                                    }
                                />
                            </FilterAccordion>

                            {/* Price */}
                            <FilterAccordion
                                icon={
                                    <Banknote
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Price"
                            >
                                <PriceFilter />
                            </FilterAccordion>

                            {/* Color */}
                            <FilterAccordion
                                icon={
                                    <Palette
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Color"
                            >
                                <ColorFilter
                                    colors={
                                        facets.colors
                                    }
                                />
                            </FilterAccordion>

                            {/* Material */}
                            <FilterAccordion
                                icon={
                                    <Layers
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Material"
                            >
                                <MaterialFilter
                                    materials={
                                        facets.materials
                                    }
                                />
                            </FilterAccordion>

                            {/* Condition */}
                            <FilterAccordion
                                icon={
                                    <BadgeCheck
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Condition"
                            >
                                <ConditionFilter
                                    conditions={
                                        facets.conditions
                                    }
                                />
                            </FilterAccordion>

                            {/* Measurements */}
                            <FilterAccordion
                                icon={
                                    <Ruler
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                }
                                title="Measurements"
                            >
                                <MeasurementFilter />
                            </FilterAccordion>
                        </div>
                    </aside>

                    {/* =================================================
                        MAIN CONTENT
                    ================================================== */}

                    <section
                        className="min-w-0 flex-1"
                        aria-label="Products"
                    >
                        {/* =================================================
                            TOOLBAR
                        ================================================== */}

                        <div className="mb-5 sm:mb-7">
                            <div
                                className="
                                    flex
                                    min-w-0
                                    flex-wrap
                                    items-center
                                    gap-2
                                    sm:gap-3
                                "
                            >
                                {/* Mobile filter */}
                                <div className="shrink-0 lg:hidden">
                                    <FilterDrawer
                                        genders={
                                            genders
                                        }
                                        categories={
                                            categories
                                        }
                                        facets={
                                            facets
                                        }
                                    />
                                </div>

                                {/* Search */}
                                <div
                                    className="
                                        order-3
                                        min-w-full
                                        flex-1
                                        sm:order-none
                                        sm:min-w-0
                                    "
                                >
                                    <ToolbarSearch
                                        value={
                                            searchInput
                                        }
                                        onChange={
                                            setSearchInput
                                        }
                                        placeholder="Search products, brands…"
                                        ariaLabel="Search products"
                                    />
                                </div>

                                {/* View toggle */}
                                <SegmentedControl
                                    value={
                                        viewMode
                                    }
                                    onChange={
                                        setViewMode
                                    }
                                    options={[
                                        {
                                            value: "grid",
                                            ariaLabel:
                                                "Grid view",
                                            icon: (
                                                <LayoutGrid
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            ),
                                        },
                                        {
                                            value: "list",
                                            ariaLabel:
                                                "List view",
                                            icon: (
                                                <List
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            ),
                                        },
                                    ]}
                                    className="hidden sm:inline-flex"
                                />

                                {/* Sort */}
                                <div className="shrink-0">
                                    <SortDropdown
                                        defaultValue={
                                            initialSort
                                        }
                                    />
                                </div>
                            </div>

                            {/* Active filters */}
                            <AnimatePresence>
                                {(hasActiveFilters ||
                                    isSearchActive) && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                            }}
                                            className="
                                            mt-3
                                            flex
                                            min-w-0
                                            items-center
                                            gap-2
                                            overflow-x-auto
                                            pb-1
                                            scrollbar-none
                                            sm:mt-4
                                        "
                                        >
                                            {initialBrand && (
                                                <FilterChip
                                                    label={
                                                        initialBrand
                                                    }
                                                    onRemove={() =>
                                                        removeParam(
                                                            "brand",
                                                        )
                                                    }
                                                />
                                            )}

                                            {initialSize && (
                                                <FilterChip
                                                    label={`Size ${initialSize}`}
                                                    onRemove={() =>
                                                        removeParam(
                                                            "size",
                                                        )
                                                    }
                                                />
                                            )}

                                            {initialPrice && (
                                                <FilterChip
                                                    label={priceLabel(
                                                        initialPrice,
                                                    )}
                                                    onRemove={() =>
                                                        removeParam(
                                                            "price",
                                                        )
                                                    }
                                                />
                                            )}

                                            {initialMeasurement && (
                                                <FilterChip
                                                    label={measurementLabel(
                                                        initialMeasurement,
                                                    )}
                                                    onRemove={() =>
                                                        removeParam(
                                                            "measurement",
                                                        )
                                                    }
                                                />
                                            )}

                                            {searchParams.get(
                                                "color",
                                            ) && (
                                                    <FilterChip
                                                        label={
                                                            searchParams.get(
                                                                "color",
                                                            )!
                                                        }
                                                        onRemove={() =>
                                                            removeParam(
                                                                "color",
                                                            )
                                                        }
                                                    />
                                                )}

                                            {searchParams.get(
                                                "material",
                                            ) && (
                                                    <FilterChip
                                                        label={
                                                            searchParams.get(
                                                                "material",
                                                            )!
                                                        }
                                                        onRemove={() =>
                                                            removeParam(
                                                                "material",
                                                            )
                                                        }
                                                    />
                                                )}

                                            {searchParams.get(
                                                "condition",
                                            ) && (
                                                    <FilterChip
                                                        label={
                                                            searchParams.get(
                                                                "condition",
                                                            )!
                                                        }
                                                        onRemove={() =>
                                                            removeParam(
                                                                "condition",
                                                            )
                                                        }
                                                    />
                                                )}

                                            {searchInput && (
                                                <FilterChip
                                                    label={`"${searchInput}"`}
                                                    onRemove={() =>
                                                        setSearchInput(
                                                            "",
                                                        )
                                                    }
                                                />
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchInput(
                                                        "",
                                                    );
                                                    window.location.href =
                                                        baseUrl;
                                                }}
                                                className="
                                                min-h-9
                                                shrink-0
                                                rounded-lg
                                                px-3
                                                text-xs
                                                font-medium
                                            "
                                            >
                                                <RotateCcw
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                                Clear all
                                            </Button>
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                        </div>

                        {/* =================================================
                            RESULT META
                        ================================================== */}

                        <div
                            className="
                                mb-4
                                flex
                                min-h-6
                                items-center
                                justify-between
                                gap-3
                                sm:mb-5
                            "
                        >
                            <div className="min-w-0">
                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        leading-5
                                        text-muted-foreground
                                        sm:text-sm
                                    "
                                >
                                    {isSearchActive
                                        ? `${products.length} ${products.length ===
                                            1
                                            ? "result"
                                            : "results"
                                        } for "${searchInput.trim()}"`
                                        : `${products.length} ${products.length ===
                                            1
                                            ? "piece"
                                            : "pieces"
                                        }`}
                                </p>
                            </div>

                            {hasActiveFilters &&
                                !isSearchActive && (
                                    <span
                                        className="
                                            hidden
                                            text-xs
                                            text-muted-foreground
                                            sm:inline
                                        "
                                    >
                                        {
                                            activeFilters
                                        }{" "}
                                        active{" "}
                                        {activeFilters ===
                                            1
                                            ? "filter"
                                            : "filters"}
                                    </span>
                                )}
                        </div>

                        {/* =================================================
                            INITIAL LOADING
                        ================================================== */}

                        {loading ? (
                            <ProductGridSkeleton
                                list={
                                    viewMode ===
                                    "list"
                                }
                            />
                        ) : initialLoadError ? (
                            <ErrorState
                                onRetry={
                                    handleRetry
                                }
                            />
                        ) : products.length ===
                            0 ? (
                            /* =================================================
                                EMPTY STATE
                            ================================================== */

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                className="
                                    flex
                                    min-h-[320px]
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-border
                                    bg-muted/[0.18]
                                    px-5
                                    py-12
                                    text-center
                                    sm:min-h-[360px]
                                    sm:py-16
                                "
                            >
                                <div
                                    className="
                                        mb-4
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-muted
                                        sm:h-14
                                        sm:w-14
                                    "
                                >
                                    <AlertCircle
                                        className="
                                            h-5
                                            w-5
                                            text-muted-foreground
                                            sm:h-6
                                            sm:w-6
                                        "
                                        aria-hidden="true"
                                    />
                                </div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        leading-6
                                        tracking-[-0.01em]
                                        text-foreground
                                    "
                                >
                                    No items found
                                </h2>

                                <p
                                    className="
                                        mt-2
                                        max-w-sm
                                        text-sm
                                        leading-6
                                        text-muted-foreground
                                    "
                                >
                                    {isSearchActive
                                        ? "Try a different search or remove some filters."
                                        : "Try adjusting your filters or check back later for new arrivals."}
                                </p>

                                <Link
                                    href={baseUrl}
                                    className="
                                        mt-5
                                        inline-flex
                                        min-h-11
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-foreground
                                        px-5
                                        text-sm
                                        font-medium
                                        text-background
                                        transition-opacity
                                        hover:opacity-90
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-ring
                                    "
                                >
                                    <RotateCcw
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    Reset Filters
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                {/* =================================================
                                    PRODUCTS GRID / LIST
                                ================================================== */}

                                <AnimatePresence
                                    mode="wait"
                                    initial={false}
                                >
                                    {viewMode ===
                                        "grid" ? (
                                        <motion.div
                                            key="grid"
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className={
                                                GRID_CLASSES
                                            }
                                        >
                                            {products.map(
                                                (
                                                    product,
                                                    index,
                                                ) => (
                                                    <ProductCardGrid
                                                        key={
                                                            product.id
                                                        }
                                                        id={
                                                            product.id
                                                        }
                                                        slug={
                                                            product.slug
                                                        }
                                                        brand={
                                                            product.brand
                                                        }
                                                        title={
                                                            product.title
                                                        }
                                                        price={
                                                            product.price
                                                        }
                                                        retailPrice={
                                                            product.retailPrice
                                                        }
                                                        image={
                                                            product.primaryImage ||
                                                            product
                                                                .images?.[0] ||
                                                            ""
                                                        }
                                                        category={
                                                            product.category
                                                        }
                                                        chest={
                                                            product.chest
                                                        }
                                                        waist={
                                                            product.waist
                                                        }
                                                        length={
                                                            product.length
                                                        }
                                                        onlyOneLeft={
                                                            false
                                                        }
                                                        priority={index < 2}
                                                    />
                                                ),
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="list"
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className={
                                                LIST_CLASSES
                                            }
                                        >
                                            {products.map(
                                                (
                                                    product,
                                                    index,
                                                ) => (
                                                    <ProductCardList
                                                        key={
                                                            product.id
                                                        }
                                                        id={
                                                            product.id
                                                        }
                                                        slug={
                                                            product.slug
                                                        }
                                                        brand={
                                                            product.brand
                                                        }
                                                        title={
                                                            product.title
                                                        }
                                                        price={
                                                            product.price
                                                        }
                                                        retailPrice={
                                                            product.retailPrice
                                                        }
                                                        image={
                                                            product.primaryImage ||
                                                            product
                                                                .images?.[0] ||
                                                            ""
                                                        }
                                                        category={
                                                            product.category
                                                        }
                                                        chest={
                                                            product.chest
                                                        }
                                                        waist={
                                                            product.waist
                                                        }
                                                        length={
                                                            product.length
                                                        }
                                                        material={
                                                            product.material
                                                        }
                                                        description={
                                                            product.description
                                                        }
                                                        onlyOneLeft={
                                                            false
                                                        }
                                                        priority={index === 0}
                                                    />
                                                ),
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* =================================================
                                    LOAD MORE
                                ================================================== */}

                                {hasMore &&
                                    products.length >
                                    0 && (
                                        <div
                                            className="
                                                mt-9
                                                flex
                                                flex-col
                                                items-center
                                                gap-4
                                                sm:mt-11
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    w-full
                                                    max-w-sm
                                                    items-center
                                                    gap-3
                                                "
                                            >
                                                <Progress
                                                    value={
                                                        progressValue
                                                    }
                                                    className="h-1 bg-muted"
                                                />

                                                <span
                                                    className="
                                                        shrink-0
                                                        text-[11px]
                                                        font-medium
                                                        leading-4
                                                        text-muted-foreground
                                                        sm:text-xs
                                                    "
                                                >
                                                    {
                                                        products.length
                                                    }{" "}
                                                    shown
                                                </span>
                                            </div>

                                            {loadMoreError && (
                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        items-center
                                                        gap-2
                                                        text-center
                                                    "
                                                >
                                                    <p
                                                        className="
                                                            text-xs
                                                            leading-5
                                                            text-destructive
                                                        "
                                                    >
                                                        Couldn&apos;t
                                                        load
                                                        more
                                                        products.
                                                    </p>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={
                                                            handleLoadMore
                                                        }
                                                        className="min-h-9 text-xs"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                        Try
                                                        Again
                                                    </Button>
                                                </div>
                                            )}

                                            {!loadMoreError && (
                                                <Button
                                                    type="button"
                                                    onClick={
                                                        handleLoadMore
                                                    }
                                                    loading={
                                                        loadingMore
                                                    }
                                                    loadingText="Loading…"
                                                    variant="outline"
                                                    size="lg"
                                                    rounded="xl"
                                                    className="
                                                        min-h-11
                                                        min-w-[150px]
                                                        px-5
                                                        text-sm
                                                        font-medium
                                                        shadow-none
                                                    "
                                                >
                                                    <ChevronDown
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                    Load More
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                {/* =================================================
                                    END OF PRODUCTS
                                ================================================== */}

                                {!hasMore &&
                                    products.length >
                                    0 && (
                                        <div
                                            className="
                                                mt-9
                                                flex
                                                flex-col
                                                items-center
                                                gap-2
                                                sm:mt-11
                                            "
                                        >
                                            <Badge
                                                variant="secondary"
                                                size="md"
                                                rounded="full"
                                                className="
                                                    px-3
                                                    text-xs
                                                    font-medium
                                                "
                                            >
                                                Showing all{" "}
                                                {
                                                    products.length
                                                }{" "}
                                                {
                                                    products.length ===
                                                        1
                                                        ? "piece"
                                                        : "pieces"
                                                }
                                            </Badge>

                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    window.scrollTo(
                                                        {
                                                            top: 0,
                                                            behavior:
                                                                "smooth",
                                                        },
                                                    )
                                                }
                                                variant="ghost"
                                                size="sm"
                                                rounded="lg"
                                                className="
                                                    mt-1
                                                    min-h-9
                                                    text-xs
                                                    font-medium
                                                    sm:text-sm
                                                "
                                            >
                                                Back to
                                                top ↑
                                            </Button>
                                        </div>
                                    )}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

/*
 * =============================================================
 * LABEL HELPERS
 * =============================================================
 */

function priceLabel(
    value: string,
): string {
    const map: Record<
        string,
        string
    > = {
        "0-499": "Under ₹499",
        "500-999": "₹500 – ₹999",
        "1000-1499":
            "₹1000 – ₹1499",
        "1500+": "₹1500+",
    };

    return (
        map[value] ?? value
    );
}

function measurementLabel(
    value: string,
): string {
    return value
        .replace(
            /^chest-/i,
            "Chest ",
        )
        .replace(
            /^waist-/i,
            "Waist ",
        )
        .replace(
            /^length-/i,
            "Length ",
        )
        .replace(
            /^inseam-/i,
            "Inseam ",
        )
        .replace(
            /-plus/g,
            "+",
        )
        .replace(
            /-/g,
            "–",
        );
}