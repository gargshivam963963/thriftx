"use client";

import PremiumImage from "@/components/ui/PremiumImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";

const brands = [
    {
        name: "Nike",
        image: "/images/brands/nike.webp",
    },
    {
        name: "Adidas",
        image: "/images/brands/adidas.webp",
    },
    {
        name: "Zara",
        image: "/images/brands/zara.webp",
    },
    {
        name: "Levi's",
        image: "/images/brands/levis.webp",
    },
    {
        name: "H&M",
        image: "/images/brands/hm.webp",
    },
    {
        name: "Tommy Hilfiger",
        image: "/images/brands/tommy.webp",
    },
];

export default function BrandSection() {
    return (
        <section className="bg-neutral-50 py-20">

            <Container>

                <FadeUp>

                    <div className="mb-14 text-center">

                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                            Premium Labels
                        </span>

                        <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
                            Shop Your Favourite Brands
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
                            Discover authentic branded fashion at a fraction
                            of retail prices.
                        </p>

                    </div>

                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">

                    {brands.map((brand) => (

                        <StaggerItem key={brand.name}>

                            <Link
                                href={`/shop?brand=${encodeURIComponent(
                                    brand.name
                                )}`}
                                className="group block"
                            >

                                <div className="rounded-3xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-neutral-300 hover:shadow-xl">
                                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl">
                                        <PremiumImage
                                            src={brand.image}
                                            alt={brand.name}
                                            fill
                                            rounded
                                            fallbackSrc="/images/brands/placeholder.webp"
                                            sizes="80px"
                                            className="
            object-contain
            p-1
            transition-all
            duration-500
            ease-out
            group-hover:scale-110
        "
                                        />

                                    </div>

                                    <p className="mt-6 text-center font-semibold text-neutral-900">
                                        {brand.name}
                                    </p>

                                </div>

                            </Link>

                        </StaggerItem>

                    ))}

                </StaggerContainer>

                <FadeUp>

                    <div className="mt-14 text-center">
                        <Button
                            variant="outline"
                            size="lg"
                        >

                            <Link href="/shop">

                                Explore All Brands

                                <ArrowRight className="ml-2 h-4 w-4" />

                            </Link>

                        </Button>

                    </div>

                </FadeUp>

            </Container>

        </section>
    );
}