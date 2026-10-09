"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/Container";
import { FadeUp, ScaleIn } from "@/components/animations";
import { Card } from "@/components/ui/Card";
import { Glass, LiquidOrbs } from "@/components/ui/Glass";

const heroStats = [
    { value: "5000+", label: "Curated Pieces" },
    { value: "150+", label: "Premium Brands" },
    { value: "100%", label: "Quality Checked" },
];

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] overflow-hidden">
            <LiquidOrbs />
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-muted/40 to-transparent blur-3xl dark:from-muted/30" />
                <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-muted/30 to-transparent blur-3xl dark:from-muted/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.02),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_60%)]" />
            </div>

            <Container className="relative z-10">
                <div className="flex min-h-[90vh] flex-col items-center gap-16 py-20 lg:flex-row lg:gap-24">
                    {/* ─── LEFT: Content ─────────────────────────────────── */}
                    <div className="flex-1 pt-8 lg:pt-16">
                        <FadeUp>
                            <div className="space-y-6">
                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Badge variant="outline" size="lg" rounded="full" className="glass-liquid glass-pill px-4 py-2 text-small font-semibold tracking-wide shadow-lg">
                                        ✨ Curated Premium Thrift Fashion
                                    </Badge>
                                </motion.div>

                                {/* Headline */}
                                <h1 className="text-display-xl font-display font-bold tracking-tight text-foreground">
                                    Discover{" "}
                                    <span className="text-shimmer-liquid">
                                        Premium
                                    </span>
                                    <br />
                                    Fashion.
                                </h1>

                                <p className="max-w-lg text-body leading-relaxed text-muted-foreground">
                                    Handpicked branded clothing that combines luxury, sustainability,
                                    and affordability. Every piece is individually inspected before
                                    it reaches your wardrobe.
                                </p>

                                {/* CTA Buttons */}
                                {/* These MUST be path segments (`/shop/men`), not
                                    `?gender=men`: the shop route reads gender from
                                    the catch-all path, so a query-string gender is
                                    silently ignored and the link lands on ALL
                                    products. */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link href="/shop/men">
                                        <Button size="lg" rightIcon={<ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />}>
                                            Shop Men
                                        </Button>
                                    </Link>
                                    <Link href="/shop/women">
                                        <Button variant="outline" size="lg">
                                            Shop Women
                                        </Button>
                                    </Link>
                                </div>

                                {/* Stats Bar */}
                                <Glass hover className="grid grid-cols-3 divide-x divide-white/20 overflow-hidden rounded-2xl dark:divide-white/10">
                                    {heroStats.map((item) => (
                                        <div key={item.label} className="px-4 py-5 text-center sm:px-6 sm:py-6">
                                            <p className="text-heading-4 font-bold text-foreground">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-small font-medium text-muted-foreground">
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </Glass>

                                {/* Same-Day Delivery Banner */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-3 dark:from-emerald-950/30 dark:to-emerald-900/20"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <p className="text-body font-bold text-emerald-900 dark:text-emerald-300">
                                            Free Same-Day Delivery in Panipat
                                        </p>
                                        <p className="text-small text-emerald-600 dark:text-emerald-400">
                                            Order before 2 PM — delivered today! 🚀
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </FadeUp>
                    </div>

                    {/* ─── RIGHT: Visual ─────────────────────────────────── */}
                    <ScaleIn className="flex-1">
                        <div className="relative">
                            {/* Main Image */}
                            <div className="relative mx-auto aspect-[4/5] max-w-lg overflow-hidden rounded-3xl shadow-2xl shadow-foreground/10 dark:shadow-black/30">
                                <Image
                                    src="/images/jeans1.jpg"
                                    alt="A curated THRIFTX denim look"
                                    fill
                                    priority
                                    quality={75}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-all duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Floating Badge - Bottom Left */}
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="glass-liquid glass-card-hover absolute -bottom-6 left-0 hidden max-w-[240px] rounded-2xl p-5 lg:block"
                            >
                                <p className="text-caption text-muted-foreground">
                                    Featured Collection
                                </p>
                                <h3 className="mt-2 text-heading-4 font-semibold text-foreground">
                                    Curated Premium
                                </h3>
                                <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                                    Every product individually photographed and inspected before reaching your wardrobe.
                                </p>
                            </motion.div>
                        </div>
                    </ScaleIn>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="flex justify-center pb-8"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center gap-2"
                    >
                        <span className="text-caption text-muted-foreground">
                            Scroll
                        </span>
                        <div className="h-10 w-[1.5px] rounded-full bg-muted-foreground/50" />
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}

