"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Flame, Tag } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";
import {
    getCountdownParts,
    getWeekendSaleWindow,
    WEEKEND_SALE_CONFIG,
    type CountdownParts,
    type WeekendSaleConfig,
    type WeekendSaleWindow,
} from "@/lib/marketing/weekendSale";
import { cn } from "@/lib/utils";

interface WeekendSaleProduct {
    id: string;
    slug: string;
    brand: string;
    title: string;
    price: number;
    retailPrice?: number;
    image: string;
    category?: string;
}

interface WeekendSaleProps {
    products?: WeekendSaleProduct[];
    config?: WeekendSaleConfig;
}

const initialParts: CountdownParts = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
};

export default function WeekendSale({
    products = [],
    config = WEEKEND_SALE_CONFIG,
}: WeekendSaleProps) {
    const [window, setWindow] = useState<WeekendSaleWindow | null>(null);
    const [parts, setParts] = useState<CountdownParts>(initialParts);

    // Compute the sale window client-side so it always reflects the current
    // date/time without hardcoding anything.
    useEffect(() => {
        const update = () => {
            const w = getWeekendSaleWindow(new Date(), config);
            setWindow(w);
            setParts(getCountdownParts(w.nextStart));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [config]);

    const featured = useMemo(() => products.slice(0, 4), [products]);

    if (!window) {
        // Reserve exact space to avoid any layout shift while mounting.
        return (
            <section className="bg-card py-16 md:py-24" aria-hidden="true">
                <Container>
                    <div className="h-64 animate-pulse bg-muted" />
                </Container>
            </section>
        );
    }

    // Only render the full sale section during the active weekend window.
    if (!window.active) return null;

    const segments = [
        { label: "Days", value: parts.days },
        { label: "Hrs", value: parts.hours },
        { label: "Min", value: parts.minutes },
        { label: "Sec", value: parts.seconds },
    ];

    return (
        <section className="relative isolate overflow-hidden bg-card py-16 md:py-24">
            {/* Decorative gradient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            <Container className="relative">
                {/* ── Header ─────────────────────────────────────────── */}
                <FadeUp>
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div className="space-y-4">
                            <Badge variant="warning" size="md" rounded="full" className="gap-1.5">
                                <Flame size={14} />
                                {config.badge}
                            </Badge>
                            <h2 className="text-h2 font-bold text-foreground">
                                {config.title}
                            </h2>
                            <p className="max-w-xl text-body text-muted-foreground">
                                {config.subtitle}
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
                                <Tag size={14} className="text-muted-foreground" />
                                <span className="text-badge font-bold uppercase tracking-wider text-foreground">
                                    Use code {config.couponCode}
                                </span>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center gap-2.5">
                            {segments.map((seg) => (
                                <div
                                    key={seg.label}
                                    className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-sm sm:h-20 sm:w-20"
                                >
                                    <span className="text-heading-4 font-bold tabular-nums text-foreground">
                                        {String(seg.value).padStart(2, "0")}
                                    </span>
                                    <span className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                        {seg.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeUp>

                {/* ── Featured products ──────────────────────────────── */}
                {featured.length > 0 ? (
                    <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
                        {featured.map((product) => (
                            <StaggerItem key={product.id}>
                                <div className="relative">
                                    <ProductCard
                                        id={product.id}
                                        slug={product.slug}
                                        brand={product.brand}
                                        title={product.title}
                                        price={product.price}
                                        retailPrice={product.retailPrice}
                                        image={product.image}
                                        category={product.category}
                                        onlyOneLeft
                                    />
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border bg-muted/50 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background">
                            <Flame className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-heading-4 font-semibold text-foreground">
                                {config.discountLabel} this weekend
                            </h3>
                            <p className="mx-auto max-w-md text-body text-muted-foreground">
                                Discover exclusive weekend drops across premium brands.
                            </p>
                        </div>
                        <Link href={config.shopHref}>
                            <Button size="lg" rightIcon={<ArrowRight />}>
                                Shop the Sale
                            </Button>
                        </Link>
                    </div>
                )}

                {/* ── Footer CTA ─────────────────────────────────────── */}
                <FadeUp>
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-6 sm:flex-row sm:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-button font-bold text-white">
                                    {config.discountLabel}
                                </p>
                                <p className="text-badge font-semibold uppercase tracking-wider text-white/80">
                                    Ends Sunday — don&apos;t miss out
                                </p>
                            </div>
                        </div>
                        <Link href={config.shopHref}>
                            <Button
                                size="lg"
                                rounded="full"
                                className="bg-white text-orange-600 hover:bg-white/90 dark:bg-white dark:text-orange-600"
                                rightIcon={<ArrowRight />}
                            >
                                Shop the Sale
                            </Button>
                        </Link>
                    </div>
                </FadeUp>
            </Container>
        </section>
    );
}
