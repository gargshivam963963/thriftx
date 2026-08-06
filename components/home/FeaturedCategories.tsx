"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/Container";
import PremiumImage from "@/components/ui/PremiumImage";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { Card } from "@/components/ui/Card";

const categories = [
    {
        title: "Men",
        image: "/images/categories/men.jpg",
        href: "/shop/men",
        productCount: 326,
        badge: "Trending",
    },
    {
        title: "Women",
        image: "/images/categories/women.jpg",
        href: "/shop/women",
        productCount: 294,
        badge: "New",
    },
    {
        title: "Vintage",
        image: "/images/categories/vintage.jpg",
        href: "/shop?sort=newest",
        productCount: 186,
        badge: "Editor's Pick",
    },
    {
        title: "Luxury",
        image: "/images/categories/luxury.jpg",
        href: "/shop?sort=price-high",
        productCount: 148,
        badge: "Premium",
    },
];

export default function FeaturedCategories() {
    return (
        <section className="py-16 md:py-24">
            <Container>
                <FadeUp>
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <Badge variant="secondary" size="md" rounded="full" className="mb-5">
                            Curated Collections
                        </Badge>
                        <h2 className="text-h2 font-bold text-foreground">
                            Shop by Category
                        </h2>
                        <p className="mt-4 text-body text-muted-foreground">
                            Every collection is carefully curated with premium branded pieces,
                            individually quality checked before reaching your wardrobe.
                        </p>
                    </div>
                </FadeUp>

                <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {categories.map((category) => (
                        <StaggerItem key={category.title}>
                            <Link href={category.href} className="group block h-full">
                                <Card className="relative h-full overflow-hidden border-border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <PremiumImage
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            rounded={false}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                            className="object-cover transition-all duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                        {category.badge && (
                                            <div className="absolute left-4 top-4">
                                                <Badge
                                                    variant="secondary"
                                                    size="sm"
                                                    rounded="full"
                                                    className="bg-white/90 text-foreground backdrop-blur-sm dark:bg-foreground/90 dark:text-foreground"
                                                >
                                                    {category.badge}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                            <p className="text-caption font-semibold uppercase tracking-widest text-white/70">
                                                {category.productCount}+ Products
                                            </p>
                                            <h3 className="mt-1.5 text-heading-4 font-bold tracking-tight">
                                                {category.title}
                                            </h3>
                                            <div className="mt-4 flex items-center gap-1 text-body font-medium text-white/90">
                                                Shop Collection
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </Container>
        </section>
    );
}

