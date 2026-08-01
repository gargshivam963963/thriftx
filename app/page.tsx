import {
  BestProducts,
  BrandSection,
  FeaturedCategories,
  Hero,
  InstagramFeed,
  Newsletter,
  TrustStrip,
  WhyThriftX,
} from "@/components/home";
import { getProducts } from "@/lib/services/products";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";

export default async function HomePage() {
  const products = await getProducts({
    limit: 8,
  });

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <TrustStrip />
      <FeaturedCategories />
      <BestProducts products={products} />
      <RecentlyViewedSection />
      <BrandSection />
      <WhyThriftX />
      <InstagramFeed />
      <Newsletter />
    </main>
  );
}