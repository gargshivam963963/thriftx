"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Heart,
    ShoppingBag,
    Trash2,
    AlertCircle,
    RefreshCw,
    Eye,
    Sparkles,
    IndianRupee,
    HeartOff,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { toggleWishlist } from "@/lib/services/wishlist";
import {
    getWishlistProducts,
    type WishlistProduct,
} from "@/lib/services/getWishlistProducts";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="h-72 animate-pulse rounded-3xl bg-zinc-100 sm:h-80"
                />
            ))}
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function WishlistEmpty() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                <HeartOff size={28} className="text-rose-400" />
            </div>
            <h2 className="mt-5 font-serif text-xl font-semibold text-zinc-900">
                Your wishlist is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Save items you love to your wishlist and come back to them anytime.
            </p>
            <Link href="/shop">
                <Button
                    className="mt-6 rounded-xl"
                    leftIcon={<ShoppingBag size={16} />}
                    rightIcon={<ArrowLeft size={16} />}
                >
                    Discover Products
                </Button>
            </Link>
        </motion.div>
    );
}

// ─── Error State ─────────────────────────────────────────────────────────────

function WishlistError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle size={28} className="text-red-400" />
            </div>
            <h2 className="mt-5 font-serif text-xl font-semibold text-red-900">
                Couldn&apos;t load wishlist
            </h2>
            <p className="mt-2 text-sm text-red-600">
                Something went wrong. Please try again.
            </p>
            <Button
                variant="outline"
                className="mt-6 rounded-xl"
                leftIcon={<RefreshCw size={16} />}
                onClick={onRetry}
            >
                Try Again
            </Button>
        </div>
    );
}

// ─── Wishlist Card ───────────────────────────────────────────────────────────

function WishlistCard({
    item,
    onRemove,
    removing,
}: {
    item: WishlistProduct;
    onRemove: () => void;
    removing: boolean;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg"
        >
            {/* Image */}
            <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 sm:aspect-square">
                    <img
                        src={item.primaryImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2'/%3E%3Cline x1='12' y1='8' x2='12' y2='16'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E";
                            (e.target as HTMLImageElement).className =
                                "h-12 w-12 opacity-30";
                        }}
                    />

                    {/* Quick actions overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                        <Link href={`/product/${item.slug}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110">
                                <Eye size={18} className="text-zinc-900" />
                            </div>
                        </Link>
                    </div>

                    {/* Remove button */}
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={removing}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-rose-500 shadow backdrop-blur-sm transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </Link>

            {/* Details */}
            <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    {item.brand || item.category}
                </p>

                <Link href={`/product/${item.slug}`}>
                    <h3 className="mt-1 line-clamp-1 font-serif text-base font-bold text-zinc-900 transition hover:text-zinc-600 sm:text-lg">
                        {item.title}
                    </h3>
                </Link>

                <div className="mt-2 flex items-center flex-wrap gap-2">
                    <p className="font-serif text-lg sm:text-xl font-bold text-zinc-900">
                        ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    {item.size && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500">
                            {item.size}
                        </span>
                    )}
                    {item.condition && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500">
                            {item.condition}
                        </span>
                    )}
                </div>

                {/* Remove button on mobile */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 size={13} />}
                    onClick={onRemove}
                    loading={removing}
                    className="mt-3 w-full rounded-xl text-xs sm:hidden"
                >
                    Remove
                </Button>
            </div>
        </motion.div>
    );
}

// ─── Main Wishlist Page ──────────────────────────────────────────────────────

export default function ProfileWishlistPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [items, setItems] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    const fetchItems = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getWishlistProducts();
            setItems(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load wishlist.");
            toast.error("Could not load your wishlist.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile/wishlist");
            return;
        }
        fetchItems();
    }, [authLoading, user, router, fetchItems]);

    const handleRemove = async (item: WishlistProduct) => {
        if (removingIds.has(item.productId)) return;
        try {
            setRemovingIds((prev) => new Set(prev).add(item.productId));
            await toggleWishlist(item.productId);
            setItems((prev) => prev.filter((i) => i.productId !== item.productId));
            toast.success("Removed from wishlist.");
        } catch {
            toast.error("Failed to remove item.");
        } finally {
            setRemovingIds((prev) => {
                const next = new Set(prev);
                next.delete(item.productId);
                return next;
            });
        }
    };

    if (authLoading || !user) return null;

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-900"
                    >
                        <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                            <ArrowLeft size={14} />
                        </div>
                        Profile
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                            <Heart size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Saved Items
                            </p>
                            <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                My Wishlist
                            </h1>
                        </div>
                    </div>

                    {!loading && !error && items.length > 0 && (
                        <p className="mt-2 text-sm text-zinc-500">
                            {items.length}{" "}
                            {items.length === 1 ? "item" : "items"} saved
                        </p>
                    )}
                </motion.div>

                {/* States */}
                {loading && <WishlistSkeleton />}
                {error && !loading && <WishlistError onRetry={fetchItems} />}
                {!loading && !error && items.length === 0 && <WishlistEmpty />}

                {/* Grid */}
                {!loading && !error && items.length > 0 && (
                    <AnimatePresence mode="popLayout">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <WishlistCard
                                    key={item.productId}
                                    item={item}
                                    onRemove={() => handleRemove(item)}
                                    removing={removingIds.has(item.productId)}
                                />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </main>
    );
}

