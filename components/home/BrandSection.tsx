"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
    FadeUp,
    lift,
    StaggerContainer,
    StaggerItem,
    transitions,
} from "@/components/animations";
import { cn } from "@/lib/utils";

interface Brand {
    name: string;
    /** Optional overrides for the wordmark styling. */
    className?: string;
}

const brands: Brand[] = [
    { name: "Nike", className: "font-black italic tracking-tight" },
    { name: "Adidas", className: "font-bold tracking-widest" },
    { name: "Puma", className: "font-black italic tracking-wide" },
    { name: "Zara", className: "font-bold tracking-caps-wide" },
    { name: "H&M", className: "font-black tracking-caps-wide" },
    { name: "Levi's", className: "font-bold tracking-tight" },
    {
        name: "Tommy Hilfiger",
        className: "font-bold tracking-wide",
    },
    {
        name: "Ralph Lauren",
        className: "font-bold tracking-wide italic",
    },
    { name: "Uniqlo", className: "font-black lowercase tracking-caps" },
    { name: "Lacoste", className: "font-black tracking-caps-wide" },
];

export default function BrandSection() {
    return (
        <section className="bg-muted/55 py-24">
            <Container>
                <FadeUp>
                    <div className="mb-14 text-center">
                        <Badge variant="secondary" size="md" rounded="full" className="mb-5">
                            Premium Labels
                        </Badge>
                        <h2 className="text-h2 font-bold text-foreground">
                            Shop Your Favourite Brands
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-body text-muted-foreground">
                            Authentic, quality-checked pieces from the world&apos;s most
                            coveted fashion labels — at a fraction of retail.
                        </p>
                    </div>
                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {brands.map((brand) => (
                        <StaggerItem key={brand.name}>
                            <motion.div
                                whileHover={lift.card}
                                transition={transitions.springSnappy}
                            >
                                <Link
                                    href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                                    aria-label={`Shop ${brand.name}`}
                                    className="group block h-full"
                                >
                                    <Card className="flex h-28 flex-col items-center justify-center border-border bg-card p-4 transition-all duration-300 hover:border-foreground/40 hover:shadow-lg">
                                        <span
                                            className={cn(
                                                "select-none text-center text-title text-foreground transition-all duration-300 group-hover:text-foreground",
                                                brand.className,
                                            )}
                                        >
                                            {brand.name}
                                        </span>
                                        <span className="mt-2 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-8" />
                                    </Card>
                                </Link>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                <FadeUp>
                    <div className="mt-14 text-center">
                        <Link href="/shop">
                            <Button variant="outline" size="lg" rightIcon={<ArrowRight />}>
                                Explore All Brands
                            </Button>
                        </Link>
                    </div>
                </FadeUp>
            </Container>
        </section>
    );
}
