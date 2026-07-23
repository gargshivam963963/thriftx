"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ShieldCheck,
    Sparkles,
    Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    FadeIn,
    FadeUp,
    ScaleIn,
} from "@/components/animations";

const heroStats = [
    {
        value: "5000+",
        label: "Curated Pieces",
    },
    {
        value: "150+",
        label: "Premium Brands",
    },
    {
        value: "100%",
        label: "Quality Checked",
    },
];

const trustItems = [
    {
        icon: ShieldCheck,
        title: "Quality Checked",
        subtitle: "Every item inspected",
    },
    {
        icon: Truck,
        title: "Fast Shipping",
        subtitle: "Quick & secure delivery",
    },
    {
        icon: Sparkles,
        title: "Unique Pieces",
        subtitle: "Only one available",
    },
];

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-white">
            {/* Background */}

            <div className="absolute inset-0">

                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-neutral-200/30 blur-3xl" />

                <div className="absolute right-0 bottom-0 h-[450px] w-[450px] rounded-full bg-neutral-300/30 blur-3xl" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.7),transparent_65%)]" />

            </div>

            <Container className="relative z-10">
                <div className="grid min-h-[90vh] items-center gap-28 py-24 lg:grid-cols-[0.75fr_1.25fr]">
                    {/* LEFT */}
                    <FadeUp>

                        <div className="space-y-8">
                            <motion.span
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.5,
                                }}
                                className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur-xl"
                            >
                                ✨ Curated Premium Thrift Fashion
                            </motion.span>

                            <div className="space-y-5">
                                <h1 className="
font-serif
text-6xl
font-semibold
leading-[0.95]
tracking-[-0.04em]
text-neutral-900
md:text-7xl
xl:text-[96px]
">
                                    Discover
                                    <br />

                                    Premium
                                    <br />

                                    <span className="text-neutral-500">
                                        Fashion.
                                    </span>

                                </h1>

                                <p className="
max-w-[620px]
text-xl
leading-9
text-neutral-600
">
                                    Handpicked branded clothing that
                                    combines luxury, sustainability,
                                    and affordability. Every piece is
                                    individually inspected before it
                                    reaches your wardrobe.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-5 pt-4">
                                <Link href="/shop?gender=men">
                                    <Button
                                        size="lg"
                                        className="group"
                                    >
                                        Shop Men

                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Button>
                                </Link>

                                <Link href="/shop?gender=women">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                    >
                                        Shop Women
                                    </Button>
                                </Link>
                            </div>

                            <div className="
mt-12
flex
overflow-hidden
rounded-[28px]
border
border-neutral-200
bg-white/80
backdrop-blur-xl
shadow-lg
">
                                {heroStats.map((item, index) => (
                                    <div
                                        key={item.label}
                                        className={`
            flex-1
            px-8
            py-6
            ${index !== heroStats.length - 1 ? "border-r border-neutral-200" : ""}
        `}
                                    >
                                        <p className="text-4xl font-bold text-neutral-900">
                                            {item.value}
                                        </p>

                                        <p className="mt-2 text-sm text-neutral-500">
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeUp>

                    {/* RIGHT */}

                    <ScaleIn>
                        <div className="relative">
                            <div className="relative flex justify-end">
                                <Image
                                    src="/images/hero.jpg"
                                    alt="THRIFTX Premium Fashion"
                                    width={1400}
                                    height={1700}
                                    priority
                                    quality={100}
                                    className="
            h-[920px]
            w-[108%]
            max-w-none
            rounded-[44px]
            object-cover
            shadow-[0_70px_120px_rgba(0,0,0,.18)]
            transition-all
            duration-700
            hover:scale-[1.02]
        "
                                />

                            </div>

                            <GlassCard className="absolute -bottom-10 left-10 max-w-[300px] rounded-[28px] p-6">

                                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                                    Featured Collection
                                </span>

                                <h3 className="mt-3 text-2xl font-semibold text-neutral-900">
                                    Curated Premium
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-neutral-600">
                                    Every product is individually photographed,
                                    inspected and carefully selected before
                                    reaching your wardrobe.
                                </p>

                            </GlassCard>

                            <GlassCard className="
absolute
-right-6
top-24
hidden
max-w-[260px]
rounded-[28px]
p-6
xl:block
">

                                <div className="space-y-3">

                                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                                        Why THRIFTX
                                    </p>

                                    <div className="space-y-3">
                                        {trustItems.map(({ icon: Icon, title, subtitle }) => (
                                            <div
                                                key={title}
                                                className="flex items-center gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-neutral-100/60"
                                            >
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        {title}
                                                    </p>

                                                    <p className="text-xs text-neutral-500">
                                                        {subtitle}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                    </div>

                                </div>

                            </GlassCard>

                        </div>
                    </ScaleIn>

                </div>

                <FadeIn>

                    <div className="flex justify-center pb-6">

                        <motion.div
                            whileHover={{
                                scale: 1.02,
                            }}
                            animate={{
                                y: [0, 10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                            className="flex flex-col items-center gap-2"
                        >
                            <span className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                                Scroll
                            </span>

                            <div className="h-12 w-[2px] rounded-full bg-neutral-300" />
                        </motion.div>

                    </div>

                </FadeIn>

            </Container>

        </section>
    );
}