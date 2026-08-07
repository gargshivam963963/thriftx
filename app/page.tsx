import dynamic from "next/dynamic";
import {
  BestProducts,
  BrandSection,
  FeaturedCategories,
  Hero,
  InstagramFeed,
  TrustStrip,
  WeekendSale,
  WhyThriftX,
} from "@/components/home";
import { getProducts } from "@/lib/services/products";
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

export default async function HomePage() {
  const products = await getProducts({
    limit: 8,
  });

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <TrustStrip />
      <WeekendSale />
      <FeaturedCategories />
      <BestProducts products={products} />
      <RecentlyViewedSection />
      <BrandSectionLazy />
      <WhyThriftXLazy />
      <InstagramFeedLazy />
    </main>
  );
}
