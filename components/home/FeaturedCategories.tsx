"use client";

import { FadeUp } from "@/components/animations";
import { Container } from "@/components/ui/Container";

import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";

const categories = [
    {
        title: "Men",
        image: "/images/categories/men.jpg",
        href: "/shop?gender=men",
        productCount: 326,
        badge: "Trending",
    },
    {
        title: "Women",
        image: "/images/categories/women.jpg",
        href: "/shop?gender=women",
        productCount: 294,
        badge: "New",
    },
    {
        title: "Vintage",
        image: "/images/categories/vintage.jpg",
        href: "/shop?category=vintage",
        productCount: 186,
        badge: "Editor's Pick",
    },
    {
        title: "Luxury",
        image: "/images/categories/luxury.jpg",
        href: "/shop?category=luxury",
        productCount: 148,
        badge: "Premium",
    },
];

const loading = false;

export default function FeaturedCategories() {
    return (
        <section className="py-16 md:py-24 lg:py-28">
            <Container>
                <FadeUp>
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                            Curated Collections
                        </span>

                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-neutral-900 md:text-5xl">
                            Shop by Category
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
                            Every collection is carefully curated with premium branded pieces,
                            individually quality checked before reaching your wardrobe.
                        </p>
                    </div>
                </FadeUp>

                <div className="mt-10 md:mt-14">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <CategorySkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.title}
                                    title={category.title}
                                    image={category.image}
                                    href={category.href}
                                    productCount={category.productCount}
                                    badge={category.badge}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}