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
    Eye,
    HeartOff,
} from "lucide-react";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useWishlist } from "@/lib/WishlistContext";
import type { WishlistProduct } from "@/lib/services/getWishlistProducts";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="h-72 animate-pulse rounded-3xl bg-muted sm:h-80"
                />
            ))}
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function WishlistEmpty() {
    return (
        <EmptyState
            icon={<HeartOff size={28} className="text-error" />}
            title="Your wishlist is empty"
            description="Save items you love to your wishlist and come back to them anytime."
        >
            <Link href="/shop">
                <Button
                    className="mt-6 rounded-xl"
                    leftIcon={<ShoppingBag size={16} />}
                    rightIcon={<ArrowLeft size={16} />}
                >
                    Discover Products
                </Button>
            </Link>
        </EmptyState>
    );
}

// ─── Error State ─────────────────────────────────────────────────────────────

function WishlistError({ onRetry }: { onRetry: () => void }) {
    return (
        <EmptyState
            className="border-error-bg bg-error-bg"
            icon={<AlertCircle size={28} className="text-error" />}
            title="Couldn't load wishlist"
            description="Something went wrong. Please try again."
            actionLabel="Try Again"
            onAction={onRetry}
        />
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
    const router = useRouter();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:shadow-modal"
        >
            {/* Image */}
            <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-muted sm:aspect-square">
                    <PremiumImage
                        src={item.primaryImage || "/images/placeholder.jpg"}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 280px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fallbackSrc="/images/placeholder.jpg"
                    />

                    {/* Quick actions overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/20 group-hover:opacity-100">
                        <Button
                            type="button"
                            variant="ghost"
                            size="iconMd"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg transition hover:scale-110"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/product/${item.slug}`);
                            }}
                        >
                            <Eye size={18} className="text-foreground" />
                        </Button>
                    </div>

                    {/* Remove button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="iconSm"
                        onClick={onRemove}
                        loading={removing}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-error shadow backdrop-blur-sm transition hover:bg-error hover:text-background disabled:opacity-50"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </Link>

            {/* Details */}
            <div className="p-4 sm:p-5">
                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {item.brand || item.category}
                </p>

                <Link href={`/product/${item.slug}`}>
                    <h3 className="mt-1 line-clamp-1 font-display text-body-lg font-bold text-foreground transition hover:text-muted-foreground">
                        {item.title}
                    </h3>
                </Link>

                <div className="mt-2 flex items-center flex-wrap gap-2">
                    <p className="font-display text-heading-4 font-bold text-foreground">
                        ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    {item.size && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-badge font-medium text-muted-foreground">
                            {item.size}
                        </span>
                    )}
                    {item.condition && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-badge font-medium text-muted-foreground">
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
                    className="mt-3 w-full rounded-xl text-small sm:hidden"
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
    const { toggle } = useWishlist();

    const [items, setItems] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    const fetchItems = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/wishlist");
            if (!res.ok) {
                throw new Error(`wishlist request failed: ${res.status}`);
            }
            const json = await res.json();
            setItems(Array.isArray(json?.items) ? json.items : []);
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
            await toggle(item.productId);
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
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-6 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <div className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error text-background shadow-lg">
                            <Heart size={22} />
                        </div>
                        <div>
                            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Saved Items
                            </p>
                            <h1 className="font-display text-heading-2 font-bold tracking-tight text-foreground">
                                My Wishlist
                            </h1>
                        </div>
                    </div>

                    {!loading && !error && items.length > 0 && (
                        <p className="mt-2 text-body-sm text-muted-foreground">
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