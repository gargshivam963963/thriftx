"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/Container";
import PremiumImage from "@/components/ui/PremiumImage";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";

const brands = [
    { name: "Nike", image: "/images/brands/nike.webp" },
    { name: "Adidas", image: "/images/brands/adidas.webp" },
    { name: "Zara", image: "/images/brands/zara.webp" },
    { name: "Levi's", image: "/images/brands/levis.webp" },
    { name: "H&M", image: "/images/brands/hm.webp" },
    { name: "Tommy Hilfiger", image: "/images/brands/tommy.webp" },
];

export default function BrandSection() {
    return (
        <section className="bg-white py-24 dark:bg-neutral-900">
            <Container>
                <FadeUp>
                    <div className="mb-14 text-center">
                        <Badge variant="secondary" size="md" rounded="full" className="mb-5">
                            Premium Labels
                        </Badge>
                        <h2 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100">
                            Shop Your Favourite Brands
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-body text-neutral-600 dark:text-neutral-400">
                            Discover authentic branded fashion at a fraction of retail prices.
                        </p>
                    </div>
                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {brands.map((brand) => (
                        <StaggerItem key={brand.name}>
                            <Link
                                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                                className="group block h-full"
                            >
                                <Card className="flex h-full flex-col items-center justify-center border-neutral-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-700 dark:hover:border-neutral-600">
                                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl">
                                        <PremiumImage
                                            src={brand.image}
                                            alt={brand.name}
                                            fill
                                            rounded={false}
                                            fallbackSrc="/images/brands/placeholder.webp"
                                            sizes="80px"
                                            className="object-contain p-1 transition-all duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <p className="mt-4 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                        {brand.name}
                                    </p>
                                </Card>
                            </Link>
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

