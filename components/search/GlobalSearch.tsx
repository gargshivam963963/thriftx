"use client";


import { Button } from '@/components/ui/button'; import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    TrendingUp,
    Clock,
    ArrowRight,
    Package,
    Zap,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    searchProducts,
    getTrendingSearches,
    getRecentSearches,
    saveRecentSearch,
    clearRecentSearches,
    type SearchResult,
} from "@/lib/services/searchService";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

interface GlobalSearchProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Debounce hook — delays value updates by `delay` ms
 */
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const { trackSearch } = useAnalytics();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(true);

    const debouncedQuery = useDebounce(query, 400); // 400ms debounce

    // Load recent searches on open
    useEffect(() => {
        if (open) {
            setRecentSearches(getRecentSearches());
            setShowRecent(true);
            setTimeout(() => inputRef.current?.focus(), 150);
        } else {
            setQuery("");
            setResults([]);
            setHasSearched(false);
            setSelectedIndex(-1);
        }
    }, [open]);

    // Perform search when debounced query changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setHasSearched(true);
        setShowRecent(false);

        searchProducts(debouncedQuery, 12).then((data) => {
            if (!cancelled) {
                setResults(data);
                setLoading(false);
                setSelectedIndex(-1);
                // Track the search event for analytics
                trackSearch(debouncedQuery, data.length);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const handleSubmit = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!query.trim()) return;

            // If there's a selected item, navigate to it
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                const item = results[selectedIndex];
                saveRecentSearch(item.title);
                onClose();
                router.push(`/product/${item.slug}`);
                return;
            }

            saveRecentSearch(query.trim());
            onClose();
            router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
        },
        [query, results, selectedIndex, router, onClose],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < results.length - 1 ? prev + 1 : 0,
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : results.length - 1,
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    handleSubmit();
                    break;
                case "Escape":
                    onClose();
                    break;
            }
        },
        [results.length, handleSubmit, onClose],
    );

    const handleSuggestionClick = useCallback(
        (suggestion: string) => {
            saveRecentSearch(suggestion);
            onClose();
            router.push(`/shop?search=${encodeURIComponent(suggestion)}`);
        },
        [router, onClose],
    );

    const handleResultClick = useCallback(
        (item: SearchResult) => {
            saveRecentSearch(item.title);
            onClose();
            router.push(`/product/${item.slug}`);
        },
        [router, onClose],
    );

    const handleViewAllResults = useCallback(() => {
        if (query.trim()) {
            saveRecentSearch(query.trim());
            onClose();
            router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
        }
    }, [query, router, onClose]);

    const trendingSearches = getTrendingSearches();

    const containerVariants = {
        hidden: { opacity: 0, y: -20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, damping: 30, stiffness: 300 },
        },
        exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.15 } },
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Search Panel */}
                    <motion.div
                        ref={panelRef}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl shadow-black/10 dark:border-border/60 dark:bg-card"
                    >
                        {/* Search Input */}
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Search size={22} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setShowRecent(false);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search products, brands, categories..."
                                className="h-16 w-full border-0 bg-transparent pl-14 pr-14 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground dark:text-foreground dark:placeholder:text-muted-foreground"
                                autoComplete="off"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="iconMd"
                                onClick={onClose}
                                title="Close search (Esc)"
                                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                            >
                                <X size={18} />
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="h-px bg-muted" />

                        {/* Results Panel */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {/* Loading State */}
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative h-8 w-8">
                                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-foreground dark:border-border dark:border-t-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Searching products...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Results Grid */}
                            {!loading && results.length > 0 && (
                                <div className="p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Products ({results.length})
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleViewAllResults}
                                            title="View all search results"
                                            className="flex items-center gap-1 text-xs font-semibold text-foreground transition hover:opacity-70 dark:text-foreground"
                                        >
                                            View All <ArrowRight size={12} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {results.map((item, index) => (
                                            <motion.button
                                                key={item.id}
                                                type="button"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                onClick={() => handleResultClick(item)}
                                                className={cn(
                                                    "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all",
                                                    selectedIndex === index
                                                        ? "border-foreground shadow-md ring-2 ring-foreground/10 dark:border-border"
                                                        : "border-border/80 hover:border-foreground hover:shadow-md dark:border-border/60 dark:hover:border-border",
                                                )}
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                                    {item.primaryImage ? (
                                                        <Image
                                                            src={item.primaryImage}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover transition duration-300 group-hover:scale-105"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Package size={24} className="text-muted-foreground dark:text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    {/* Price badge */}
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="rounded-lg bg-card/90 px-2 py-1 text-[11px] font-bold text-foreground shadow-sm backdrop-blur-sm dark:bg-card/90 dark:text-foreground">
                                                            ₹{item.price}
                                                        </span>
                                                    </div>
                                                    {item.retailPrice && item.retailPrice > item.price && (
                                                        <div className="absolute bottom-2 right-2">
                                                            <span className="rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white">
                                                                {Math.round(
                                                                    ((item.retailPrice - item.price) / item.retailPrice) * 100,
                                                                )}
                                                                % OFF
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-2.5">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {item.brand}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                                                        {item.title}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <span>{item.category}</span>
                                                        <span>&middot;</span>
                                                        <span>{item.size}</span>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results */}
                            {!loading && hasSearched && results.length === 0 && (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                        <Search size={24} className="text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">
                                        No results for &ldquo;{debouncedQuery}&rdquo;
                                    </h3>
                                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                                        Try checking your spelling or use a different term.
                                    </p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {trendingSearches.slice(0, 4).map((s) => (
                                            <Button
                                                key={s}
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleSuggestionClick(s)}
                                                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-white dark:border-border dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted dark:hover:text-foreground"
                                            >
                                                {s}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Initial State: Trending + Recent */}
                            {!hasSearched && !loading && (
                                <div className="p-4 space-y-5">
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="mb-2.5 flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <Clock size={13} /> Recent
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        clearRecentSearches();
                                                        setRecentSearches([]);
                                                    }}
                                                    title="Clear recent search history"
                                                    className="text-[10px] font-semibold text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground"
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map((s) => (
                                                    <Button
                                                        key={s}
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setQuery(s);
                                                            inputRef.current?.focus();
                                                        }}
                                                        className="flex items-center gap-1.5 rounded-full border border-border bg-subtle px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-white dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted dark:hover:text-foreground"
                                                    >
                                                        <Clock size={11} />
                                                        {s}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Trending */}
                                    <div>
                                        <div className="mb-2.5 flex items-center gap-2">
                                            <TrendingUp size={13} className="text-muted-foreground" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Trending
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {trendingSearches.map((s) => (
                                                <Button
                                                    key={s}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleSuggestionClick(s)}
                                                    className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-white dark:border-border dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted dark:hover:text-foreground"
                                                >
                                                    <Zap size={11} className="text-amber-500" />
                                                    {s}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick categories */}
                                    <div>
                                        <div className="mb-2.5 flex items-center gap-2">
                                            <Sparkles size={13} className="text-muted-foreground" />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Quick Browse
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {[
                                                { label: "Men", href: "/shop/men", emoji: "👔" },
                                                { label: "Women", href: "/shop/women", emoji: "👗" },
                                                { label: "New In", href: "/shop?sort=newest", emoji: "🔥" },
                                                { label: "Under ₹500", href: "/shop?price=0-499", emoji: "💸" },
                                            ].map((cat) => (
                                                <Button
                                                    key={cat.label}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        saveRecentSearch(cat.label);
                                                        onClose();
                                                        router.push(cat.href);
                                                    }}
                                                    className="flex items-center gap-2.5 rounded-xl border border-border bg-subtle px-3.5 py-3 text-sm font-semibold text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-white dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-border dark:hover:bg-muted dark:hover:text-foreground"
                                                >
                                                    <span className="text-lg">{cat.emoji}</span>
                                                    {cat.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Keyboard hints */}
                            <div className="hidden border-t border-border px-4 py-2.5 dark:border-border sm:flex items-center gap-4 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded-md border border-border bg-subtle px-1.5 py-0.5 text-badge font-bold dark:border-border dark:bg-card">
                                        ↑↓
                                    </kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded-md border border-border bg-subtle px-1.5 py-0.5 text-badge font-bold dark:border-border dark:bg-card">
                                        Enter
                                    </kbd>
                                    Open
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded-md border border-border bg-subtle px-1.5 py-0.5 text-badge font-bold dark:border-border dark:bg-card">
                                        Esc
                                    </kbd>
                                    Close
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
