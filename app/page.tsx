import {
  BestProducts,
  BrandSection,
  FeaturedCategories,
  Hero,
  InstagramFeed,
  TrustStrip,
  WhyThriftX,
} from "@/components/home";
import { getProducts } from "@/lib/services/products";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";
import SalesCountdown from "@/components/marketing/SalesCountdown";

export default async function HomePage() {
  const products = await getProducts({
    limit: 8,
  });

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <TrustStrip />
      <SalesCountdown />
      <FeaturedCategories />
      <BestProducts products={products} />
      <RecentlyViewedSection />
      <BrandSection />
      <WhyThriftX />
      <InstagramFeed />
    </main>
  );
}

