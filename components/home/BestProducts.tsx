"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
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

export default function BestProducts({ products }: BestProductsProps) {
    return (
        <section className="bg-muted/55 py-16 md:py-24">
            <Container>
                <FadeUp>
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <Badge variant="secondary" size="md" rounded="full" className="mb-4">
                                Trending Now
                            </Badge>
                            <h2 className="text-h2 font-bold text-foreground">
                                Best Picks
                            </h2>
                            <p className="mt-3 max-w-xl text-body text-muted-foreground">
                                Fresh arrivals handpicked by our team. Every item is unique and
                                available in limited quantity.
                            </p>
                        </div>
                        <Link href="/shop">
                            <Button variant="outline" size="lg" rightIcon={<ArrowRight />}>
                                View All
                            </Button>
                        </Link>
                    </div>
                </FadeUp>

                <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
                    {products.map((product) => (
                        <StaggerItem key={product.id}>
                            <ProductCard
                                id={product.id}
                                slug={product.slug}
                                brand={product.brand}
                                title={product.title}
                                price={product.price}
                                retailPrice={product.retailPrice}
                                image={
                                    product.primaryImage ??
                                    product.images?.[0] ??
                                    "/images/placeholder.jpg"
                                }
                                category={product.category}
                                chest={product.chest}
                                waist={product.waist}
                            />
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </Container>
        </section>
    );
}

