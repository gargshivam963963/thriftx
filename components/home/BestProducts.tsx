"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/lib/services/products";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";

interface BestProductsProps {
    products: Product[];
}

export default function BestProducts({
    products,
}: BestProductsProps) {
    return (
        <section className="bg-white py-20">

            <Container>

                <FadeUp>

                    <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">

                        <div>

                            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                                Trending
                            </span>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
                                Best Picks
                            </h2>

                            <p className="mt-4 max-w-2xl text-neutral-600">
                                Fresh arrivals handpicked by our team.
                                Every item is unique and available in
                                limited quantity.
                            </p>

                        </div>

                        <Link href="/shop">
                            <Button variant="outline">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">

                    {products.map((product) => (

                        <StaggerItem key={product.id}>

                            <ProductCard
                                id={product.id}
                                brand={product.brand}
                                title={product.title}
                                price={product.price}
                                condition={product.condition}
                                image={product.primaryImage ?? product.images?.[0] ?? "/placeholder.webp"}
                            />

                        </StaggerItem>

                    ))}

                </StaggerContainer>

            </Container>

        </section>
    );
}