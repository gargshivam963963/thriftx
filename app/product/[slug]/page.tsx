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
  ArrowUpRight,
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

export const revalidate = 3600;

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
    `${product.title} from ${product.brand || "THRIFTX"} — Premium curated thrift wear.`;

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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium leading-5 text-foreground">
        {value}
      </span>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/65 p-3.5 transition-colors duration-200 hover:bg-muted/40 sm:p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70">
        <Icon className="h-[18px] w-[18px] text-foreground" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold leading-5 text-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
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

  const retailPrice =
    product.retailPrice ??
    (product.price != null
      ? `₹${Math.round(product.price * 1.25).toLocaleString("en-IN")}`
      : "");

  const descriptionText =
    product.description ||
    `${product.title} from ${product.brand || "our curated collection"} is presented in ${product.condition?.toLowerCase() || "excellent"
    } condition.`;

  const retail = Number(String(retailPrice).replace(/[^\d]/g, ""));
  const discount = retail
    ? Math.round(((retail - product.price) / retail) * 100)
    : null;

  const savings = retail ? retail - product.price : null;
  const delivery = getDeliveryInfo("", undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: descriptionText,
    image: product.primaryImage,
    brand: {
      "@type": "Brand",
      name: product.brand || "THRIFTX",
    },
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <Section className="pb-24 pt-5 sm:pt-7 lg:pb-16">
        <div className="mx-auto w-full max-w-[1440px]">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-xs text-muted-foreground sm:mb-8 sm:text-sm"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>

            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />

            <Link
              href="/shop"
              className="transition-colors hover:text-foreground"
            >
              Shop
            </Link>

            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />

                <Link
                  href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {product.category}
                </Link>
              </>
            )}

            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />

            <span
              aria-current="page"
              className="max-w-[180px] truncate font-medium text-foreground sm:max-w-xs"
            >
              {product.title}
            </span>
          </nav>

          {/* Main product layout */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-10 xl:gap-14">

            {/* Gallery and product content */}
            <div className="min-w-0 space-y-6 sm:space-y-8">
              <ProductGallery
                title={product.title}
                primaryImage={product.primaryImage}
                images={product.images}
              />

              {/* Trust features */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
                <TrustItem
                  icon={ShieldCheck}
                  title="Quality Checked"
                  subtitle="Carefully inspected"
                />

                <TrustItem
                  icon={RotateCcw}
                  title="7 Day Returns"
                  subtitle="As per return policy"
                />

                <TrustItem
                  icon={PackageCheck}
                  title="Secure Packing"
                  subtitle="Packed with care"
                />

                <TrustItem
                  icon={Truck}
                  title="Pan India"
                  subtitle="Courier delivery"
                />
              </div>

              {/* Description */}
              <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70">
                    <Sparkles className="h-[18px] w-[18px]" />
                  </span>

                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      Product Description
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      The details behind this find
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    "Curated thrift piece",
                    "Quality checked before dispatch",
                    "Product photographs represent the actual item",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <p className="text-sm leading-6 text-foreground/85">
                        {item}
                      </p>
                    </div>
                  ))}

                  <p className="border-t border-border/60 pt-4 text-sm leading-7 text-muted-foreground">
                    {descriptionText}
                  </p>
                </div>
              </Card>
            </div>

            {/* Purchase information */}
            <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">

              {/* Product heading */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {product.brand || "THRIFTX"}
                    </p>

                    <h1 className="mt-2 text-[clamp(1.8rem,3vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.045em] text-foreground">
                      {product.title}
                    </h1>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <WishlistButton productId={product.id} />
                    <ShareButton
                      title={product.title}
                      price={product.price}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <span
                    className="
    inline-flex items-center gap-2
    rounded-full
    border border-emerald-200
    bg-emerald-100
    px-3 py-1.5
    text-xs font-medium
    text-emerald-800
    dark:border-emerald-800/60
    dark:bg-emerald-950/40
    dark:text-emerald-300
  "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    Available
                  </span>


                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground">
                    <BadgeCheck className="h-3.5 w-3.5 text-success" />
                    Quality Checked
                  </span>

                  {product.condition && (
                    <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      {product.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Price panel */}
              <div className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  <p className="text-4xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  {discount && product.retailPrice && (
                    <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-foreground">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {retailPrice && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm text-muted-foreground">
                      MRP{" "}
                      <span className="ml-1 line-through">
                        {retailPrice}
                      </span>
                    </p>

                    {savings != null && savings > 0 && (
                      <p className="text-sm font-medium text-success">
                        You save ₹{savings.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Inclusive of all applicable taxes
                </p>
              </div>

              {/* Purchase actions */}
              <ProductActions product={product} />

              {/* Delivery */}
              <div className="rounded-3xl border border-border/60 bg-card/65 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted/70">
                    <Truck className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold tracking-tight text-foreground">
                      {delivery.label}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {delivery.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                      Dispatch operations based in Panipat, Haryana
                    </div>
                  </div>
                </div>
              </div>

              {/* Product specifications */}
              <div className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:p-6">
                <div className="mb-3">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Product Details
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Specifications for this item
                  </p>
                </div>

                <div className="divide-y divide-border/60">
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

                {(product.chest ||
                  product.waist ||
                  product.length ||
                  product.inseam) && (
                    <div className="mt-5 border-t border-border/60 pt-5">
                      <MeasurementsCard product={product} />
                    </div>
                  )}
              </div>

              <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                Each curated piece is unique. Availability may change after purchase.
              </p>
            </aside>
          </div>

          {/* Discovery sections */}
          <div className="mt-12 space-y-8 sm:mt-16">
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

      <StickyPurchaseBar product={product} />
    </>
  );
}