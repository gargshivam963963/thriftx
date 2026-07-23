"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Sparkles,
    Truck,
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
        icon: Truck,
        title: "Fast Delivery",
        description: "Quick dispatch with secure packaging.",
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

                    {features.map(({ icon: Icon, title, description }) => (

                        <StaggerItem key={title}>

                            <motion.div
                                whileHover={{
                                    y: -6,
                                }}
                                transition={{
                                    duration: 0.25,
                                }}
                                className="group h-full rounded-3xl border border-neutral-200 bg-white p-7 transition-all duration-300 hover:border-neutral-300 hover:shadow-xl"
                            >

                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white transition-transform duration-300 group-hover:scale-110">

                                    <Icon className="h-6 w-6" />

                                </div>

                                <h3 className="text-lg font-semibold text-neutral-900">
                                    {title}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-neutral-600">
                                    {description}
                                </p>

                            </motion.div>

                        </StaggerItem>

                    ))}

                </StaggerContainer>

            </Container>
        </section>
    );
}