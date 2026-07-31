"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/Container";
import { FadeUp, ScaleIn } from "@/components/animations";

const heroStats = [
    { value: "5000+", label: "Curated Pieces" },
    { value: "150+", label: "Premium Brands" },
    { value: "100%", label: "Quality Checked" },
];

const floatingFeatures = [
    { icon: ShieldCheck, title: "Quality Checked", subtitle: "Every item inspected" },
    { icon: Truck, title: "Fast Shipping", subtitle: "Quick & secure delivery" },
    { icon: Sparkles, title: "Unique Pieces", subtitle: "Only one available" },
];

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-neutral-200/40 to-transparent blur-3xl dark:from-neutral-800/30" />
                <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-neutral-300/30 to-transparent blur-3xl dark:from-neutral-700/20" />
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
                                    <Badge variant="outline" size="lg" rounded="full" className="border-neutral-300 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide dark:border-neutral-700 dark:bg-neutral-900/70">
                                        ✨ Curated Premium Thrift Fashion
                                    </Badge>
                                </motion.div>

                                {/* Headline */}
                                <h1 className="text-display font-serif font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Discover{" "}
                                    <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-100 dark:via-neutral-400 dark:to-neutral-100">
                                        Premium
                                    </span>
                                    <br />
                                    Fashion.
                                </h1>

                                <p className="max-w-lg text-body leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    Handpicked branded clothing that combines luxury, sustainability,
                                    and affordability. Every piece is individually inspected before
                                    it reaches your wardrobe.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link href="/shop?gender=men">
                                        <Button size="lg" rightIcon={<ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />}>
                                            Shop Men
                                        </Button>
                                    </Link>
                                    <Link href="/shop?gender=women">
                                        <Button variant="outline" size="lg">
                                            Shop Women
                                        </Button>
                                    </Link>
                                </div>

                                {/* Stats Bar */}
                                <div className="grid grid-cols-3 divide-x divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 shadow-sm backdrop-blur-xl dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80">
                                    {heroStats.map((item) => (
                                        <div key={item.label} className="px-4 py-5 text-center sm:px-6 sm:py-6">
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>

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
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                                            Free Same-Day Delivery in Panipat
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
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
                            <div className="relative mx-auto aspect-[4/5] max-w-lg overflow-hidden rounded-3xl shadow-2xl shadow-neutral-900/10 dark:shadow-black/30">
                                <Image
                                    src="/images/hero.jpg"
                                    alt="THRIFTX Premium Fashion"
                                    fill
                                    priority
                                    quality={100}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-all duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Floating Badge - Bottom Left */}
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="absolute -bottom-6 -left-4 hidden max-w-[240px] rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-xl backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/90 lg:block"
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                                    Featured Collection
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    Curated Premium
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    Every product individually photographed and inspected before reaching your wardrobe.
                                </p>
                            </motion.div>

                            {/* Floating Features - Right Side */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="absolute -right-8 top-12 hidden max-w-[220px] space-y-3 rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-xl backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/90 xl:block"
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                                    Why THRIFTX
                                </p>
                                <div className="space-y-3">
                                    {floatingFeatures.map(({ icon: Icon, title, subtitle }) => (
                                        <div
                                            key={title}
                                            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                                                <Icon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {title}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
                            Scroll
                        </span>
                        <div className="h-10 w-[1.5px] rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}

