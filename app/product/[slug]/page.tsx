import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  Clock,
} from "lucide-react";

import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import ProductGallery from "@/components/product/ProductGallery";
import { getProductBySlug } from "@/lib/services/products";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";
import ProductActions from "@/app/product/[slug]/ProductActions";
import ProductViewTracker from "@/app/product/[slug]/ProductViewTracker";
import RecentlyViewedTracker from "@/components/product/RecentlyViewedTracker";
import StickyPurchaseBar from "@/components/product/StickyPurchaseBar";
import MeasurementsCard from "@/components/product/MeasurementsCard";
import SizeRecommendation from "@/components/product/SizeRecommendation";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";
import CompleteTheLookSection from "@/components/product/CompleteTheLookSection";
import { siteConfig } from "@/lib/seo";
import { getDeliveryInfo } from "@/lib/delivery";

export const revalidate = 3600; // ISR — cache product page for 1 hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  const description =
    product.description ||
    `${product.title} from ${product.brand || "THRIFTX"} — Premium branded thrift wear.`;
  const url = `${siteConfig.url}/product/${slug}`;
  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} | THRIFTX`,
      description,
      images: [{ url: product.primaryImage, width: 1200, height: 1500 }],
      url,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | THRIFTX`,
      description,
      images: [product.primaryImage],
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

function getRetailPrice(price?: number): string {
  if (price == null) return "";
  return `₹${Math.round(price * 1.25).toLocaleString("en-IN")}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span className="text-body-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ── Trust badge item ── */
function TrustBadge({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <Card className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
        <Icon className="h-5 w-5 text-foreground" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-body font-semibold text-foreground">{title}</p>
        <p className="truncate text-small text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  );
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const retailPrice = product.retailPrice ?? getRetailPrice(product.price);
  const descriptionText =
    product.description ||
    `${product.title} from ${product.brand || "our curated collection"
    } is presented in ${product.condition ? product.condition.toLowerCase() : "excellent"
    } condition and ready to be styled with confidence.`;

  const retail = Number(String(retailPrice).replace(/[^\d]/g, ""));
  const discount = retail ? Math.round(((retail - product.price) / retail) * 100) : null;
  const savings = retail ? retail - product.price : null;

  // Delivery estimate (default to courier estimate for the PDP)
  const delivery = getDeliveryInfo("", undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} from ${product.brand || "THRIFTX"}`,
    image: product.primaryImage,
    brand: { "@type": "Brand", name: product.brand || "THRIFTX" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
    category: product.category,
    material: product.material,
    color: product.color,
  };

  return (
    <>
      <ProductViewTracker product={product} />
      <RecentlyViewedTracker product={product} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section className="pt-8 pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-24 lg:pb-16">
        <div className="mx-auto w-full max-w-[1280px]">
          {/* ── Breadcrumb ── */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-small text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
            <Link href="/shop" className="transition-colors hover:text-foreground">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                <Link
                  href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="font-medium text-foreground">{product.title}</span>
          </nav>

          <div className="grid gap-8 xl:grid-cols-[1.25fr_500px]">
            {/* ── LEFT COLUMN ── */}
            <div className="min-w-0 space-y-8">
              <ProductGallery
                title={product.title}
                primaryImage={product.primaryImage}
                images={product.images}
              />

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <TrustBadge
                  icon={ShieldCheck}
                  title="100% Authentic"
                  subtitle="Quality Checked"
                />
                <TrustBadge
                  icon={RotateCcw}
                  title="7 Day Returns"
                  subtitle="Easy & Simple"
                />
                <TrustBadge
                  icon={PackageCheck}
                  title="Secure Packing"
                  subtitle="Safe Delivery"
                />
                <TrustBadge
                  icon={Truck}
                  title="Pan India"
                  subtitle="Fast & Reliable"
                />
              </div>

              {/* Measurements */}
              <MeasurementsCard product={product} />

              {/* Description */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-none">
                <h3 className="mb-4 flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Description
                </h3>
                <div className="space-y-3 text-body leading-relaxed text-foreground/90">
                  {[
                    "Premium thrift piece — curated & inspected",
                    "Quality Checked & freshly sanitized",
                    "Original product photos",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <p className="border-t border-border pt-4 text-body-sm leading-7 text-muted-foreground">
                    {descriptionText}
                  </p>
                </div>
              </Card>
            </div>

            {/* ── RIGHT COLUMN — Sticky info panel ── */}
            <div className="xl:sticky xl:top-24 xl:h-fit space-y-6">
              <div>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      {product.brand || "THRIFTX"}
                    </p>
                    <h1 className="mt-2 text-display-md leading-[1.15] font-semibold text-foreground">
                      {product.title}
                    </h1>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <WishlistButton productId={product.id} />
                    <ShareButton title={product.title} price={product.price} />
                  </div>
                </div>

                {/* Stock + condition badges */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 text-small font-semibold text-warning-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
                    </span>
                    Only 1 Left
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Quality Checked
                  </span>
                  {product.condition && (
                    <span className="rounded-full bg-muted px-3 py-1 text-small font-semibold text-muted-foreground">
                      {product.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-display-lg font-bold tracking-tight text-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {discount && product.retailPrice && (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                {retailPrice && (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-body-sm text-muted-foreground">
                      MRP{" "}
                      <span className="ml-1 line-through">{retailPrice}</span>
                    </p>
                    {savings && (
                      <p className="text-body-sm font-semibold text-success">
                        You save ₹{savings.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-small text-muted-foreground">
                  Inclusive of all taxes
                </p>
              </div>

              <hr className="border-border" />

              {/* Actions (desktop) */}
              <ProductActions product={product} />

              {/* Delivery estimate */}
              <Card className="rounded-2xl border border-border bg-card p-5 shadow-none">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
                    <Clock className="h-5 w-5 text-foreground" />
                  </span>
                  <div>
                    <p className="text-body font-semibold text-foreground">
                      {delivery.label}
                    </p>
                    <p className="mt-0.5 text-small text-muted-foreground">
                      {delivery.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Product information */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-none">
                <h3 className="mb-3 text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Product Details
                </h3>
                <div className="divide-y divide-border">
                  {product.brand && (
                    <InfoRow label="Brand" value={product.brand} />
                  )}
                  {product.category && (
                    <InfoRow label="Category" value={product.category} />
                  )}
                  {product.gender && (
                    <InfoRow label="Gender" value={product.gender} />
                  )}
                  {product.color && (
                    <InfoRow label="Color" value={product.color} />
                  )}
                  {product.material && (
                    <InfoRow label="Material" value={product.material} />
                  )}
                  {product.size && (
                    <InfoRow label="Size" value={product.size} />
                  )}
                  {product.condition && (
                    <InfoRow label="Condition" value={product.condition} />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* ── Below-the-fold sections (lazy loaded) ── */}
          <div className="mt-12 space-y-6">
            <Suspense fallback={null}>
              <SizeRecommendation product={product} />
            </Suspense>
            <Suspense fallback={null}>
              <CompleteTheLookSection product={product} />
            </Suspense>
            <Suspense fallback={null}>
              <SimilarProductsSection product={product} />
            </Suspense>
            <Suspense fallback={null}>
              <RecentlyViewedSection excludeSlug={product.slug} />
            </Suspense>
          </div>
        </div>
      </Section>

      {/* Mobile sticky purchase bar */}
      <StickyPurchaseBar product={product} />
    </>
  );
}