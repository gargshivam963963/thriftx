"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Sparkles,
    Zap,
    BadgeCheck,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";

const features = [
    {
        icon: ShieldCheck,
        title: "Quality Checked",
        description: "Every item is carefully inspected before shipping.",
    },
    {
        icon: Sparkles,
        title: "Premium Brands",
        description: "Curated fashion from trusted global brands.",
    },
    {
        icon: Zap,
        title: "⚡ Panipat Same-Day",
        description: "Free same-day delivery in Panipat. Order before 2 PM!",
        highlight: true,
    },
    {
        icon: BadgeCheck,
        title: "Trusted Shopping",
        description: "Real photos and transparent product details.",
    },
];

export default function TrustStrip() {
    return (
        <section className="relative border-y border-neutral-200 bg-white py-12">
            <Container>

                <FadeUp>

                    <div className="mb-10 text-center">

                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                            Why THRIFTX
                        </span>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                            Premium Thrift Experience
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
                            Built to make buying second-hand fashion feel as
                            premium and trustworthy as buying new.
                        </p>

                    </div>

                </FadeUp>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

                    {features.map(({ icon: Icon, title, description, highlight }) => (

                        <StaggerItem key={title}>

                            <motion.div
                                whileHover={{
                                    y: -6,
                                }}
                                transition={{
                                    duration: 0.25,
                                }}
                                className={`group h-full rounded-3xl border p-7 transition-all duration-300 hover:shadow-xl ${highlight
                                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300 hover:shadow-emerald-200/50"
                                    : "border-neutral-200 bg-white hover:border-neutral-300"
                                    }`}
                            >

                                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110 ${highlight ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-neutral-900"
                                    }`}>

                                    <Icon className="h-6 w-6" />

                                </div>

                                <h3 className={`text-lg font-semibold ${highlight ? "text-emerald-900" : "text-neutral-900"}`}>
                                    {title}
                                </h3>

                                <p className={`mt-3 text-sm leading-7 ${highlight ? "text-emerald-700" : "text-neutral-600"}`}>
                                    {description}
                                </p>

                                {highlight && (
                                    <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                        Local Hero 🏆
                                    </span>
                                )}

                            </motion.div>

                        </StaggerItem>

                    ))}

                </StaggerContainer>

            </Container>
        </section>
    );
}