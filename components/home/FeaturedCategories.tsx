"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/Container";
import PremiumImage from "@/components/ui/PremiumImage";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * A gender collection tile.
 *
 * Deliberately a *prop*, not a hardcoded list: the previous version invented
 * "Vintage" and "Luxury" collections and pointed them at `?sort=newest` /
 * `?sort=price-high` — two sort orders of the same all-products page, dressed up
 * as categories. It also printed fabricated counts ("326 Products"). Every tile
 * here now maps 1:1 to a real `/shop/<gender>` route, and `count` is the live
 * catalogue figure passed down by the page (0 → the count line is omitted
 * rather than guessed).
 */
export interface FeaturedCategory {
    title: string;
    image: string;
    href: string;
    /** Live number of available pieces; omitted/0 hides the count line. */
    count?: number;
    badge?: string;
}

interface FeaturedCategoriesProps {
    categories: FeaturedCategory[];
}

export default function FeaturedCategories({
    categories,
}: FeaturedCategoriesProps) {
    if (categories.length === 0) return null;

    return (
        <section className="py-16 md:py-24">
            <Container>
                <FadeUp>
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <Badge variant="secondary" size="md" rounded="full" className="mb-5">
                            Curated Collections
                        </Badge>
                        <h2 className="text-h2 font-bold text-foreground">
                            Shop by Collection
                        </h2>
                        <p className="mt-4 text-body text-muted-foreground">
                            Every piece is a genuine branded item, individually
                            inspected and photographed before it reaches your wardrobe.
                        </p>
                    </div>
                </FadeUp>

                {/* Column count follows the tile count so a 2-collection catalogue
                    doesn't leave two empty grid cells behind. */}
                <StaggerContainer
                    className={cn(
                        "grid grid-cols-1 gap-6 sm:grid-cols-2",
                        categories.length >= 4
                            ? "xl:grid-cols-4"
                            : categories.length === 3
                                ? "xl:grid-cols-3"
                                : "xl:grid-cols-2 xl:max-w-3xl",
                    )}
                >
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
                                                    className="bg-card/90 text-foreground backdrop-blur-sm dark:bg-card/90 dark:text-foreground"
                                                >
                                                    {category.badge}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                            {!!category.count && category.count > 0 && (
                                                <p className="text-caption font-semibold uppercase tracking-widest text-white/70">
                                                    {category.count} {category.count === 1 ? "Piece" : "Pieces"}
                                                </p>
                                            )}
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

