import dynamic from "next/dynamic";
import {
  BestProducts,
  BrandSection,
  FeaturedCategories,
  Hero,
  TrustStrip,
  WeekendSale,
  WhyThriftX,
} from "@/components/home";
import type { InstagramMediaItem } from "@/components/home/InstagramFeed";
import type { FeaturedCategory } from "@/components/home/FeaturedCategories";
import { countProducts, getProducts } from "@/lib/services/products";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";

// Lazy-loaded below-fold sections to reduce initial bundle & network requests.
const BrandSectionLazy = dynamic(
  () => import("@/components/home/BrandSection").then((m) => m.default),
  { loading: () => <div className="h-64 animate-pulse bg-muted" aria-hidden /> },
);
const WhyThriftXLazy = dynamic(
  () => import("@/components/home/WhyThriftX").then((m) => m.default),
  { loading: () => <div className="h-64 animate-pulse bg-muted" aria-hidden /> },
);
const InstagramFeedLazy = dynamic(
  () => import("@/components/home/InstagramFeed").then((m) => m.default),
  { loading: () => <div className="h-64 animate-pulse bg-muted" aria-hidden /> },
);

/** How many pieces the lookbook grid shows (2 rows of 3 on tablet/desktop). */
const LOOKBOOK_COUNT = 6;

/** Which genders the homepage promotes, in display order. */
const FEATURED_GENDERS = ["men", "women", "kids", "unisex"] as const;

/** Static fashion covers per gender — real thrift/streetwear photography. */
const GENDER_IMAGES: Record<string, string> = {
  men: "/images/categories/men.jpg",
  women: "/images/categories/women.jpg",
  kids: "/images/categories/kids.jpg",
  unisex: "/images/categories/unisex.jpg",
};

export default async function HomePage() {
  // One query serves both sections; `limit: 8` also keeps "Best Picks" full
  // even when fewer than LOOKBOOK_COUNT pieces have a usable image.
  const products = await getProducts({
    limit: Math.max(8, LOOKBOOK_COUNT),
    sort: "newest",
  });

  /**
   * The lookbook grid is built from OUR product photography, not stock images.
   * Each tile links to the product page it depicts, so the section earns its
   * place on the page instead of just decorating it.
   */
  const lookbook: InstagramMediaItem[] = products
    .filter((p) => p.primaryImage)
    .slice(0, LOOKBOOK_COUNT)
    .map((p) => ({
      id: p.id,
      type: "post" as const,
      src: p.primaryImage,
      alt: `${p.brand} ${p.title}`,
      href: `/product/${p.slug}`,
      caption: p.title,
    }));

  /**
   * Collection tiles use the live catalogue: real `/shop/<gender>` routes and
   * real piece counts. Genders with nothing in stock are dropped instead of
   * being shown with an invented number.
   */
  const genderTiles = await Promise.all(
    FEATURED_GENDERS.map(async (slug) => ({
      slug,
      count: await countProducts({ gender: slug }),
    })),
  );

  const collections: FeaturedCategory[] = genderTiles
    .filter(({ count }) => count > 0)
    .map(({ slug, count }) => ({
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      image: GENDER_IMAGES[slug] ?? "/images/placeholder.jpg",
      href: `/shop/${slug}`,
      count,
    }));

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <TrustStrip />
      <WeekendSale />
      <FeaturedCategories categories={collections} />
      <BestProducts products={products.slice(0, 8)} />
      <RecentlyViewedSection />
      <BrandSectionLazy />
      <WhyThriftXLazy />
      {/* Hidden entirely when the catalogue has no imagery yet — an empty
          social grid full of broken tiles hurts more than no section at all. */}
      {lookbook.length > 0 && <InstagramFeedLazy items={lookbook} />}
    </main>
  );
}
