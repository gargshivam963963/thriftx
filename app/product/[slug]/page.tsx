import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import ProductGallery from "@/components/product/ProductGallery";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductMeasurements from "@/components/product/ProductMeasurements";
import ProductDetails from "@/components/product/ProductDetails";
import TrustBadges from "@/components/product/TrustBadges";
import DeliveryEstimate from "@/components/product/DeliveryEstimate";
import ProductViewTracker from "@/app/product/[slug]/ProductViewTracker";
import RecentlyViewedTracker from "@/components/product/RecentlyViewedTracker";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";
import SizeRecommendation from "@/components/product/SizeRecommendation";
import CompleteTheLookSection from "@/components/product/CompleteTheLookSection";

import { getProductBySlug } from "@/lib/services/products";
import { siteConfig } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false } };
  }

  const description =
    product.description ||
    `${product.title} from ${product.brand || "THRIFTX"} — Premium branded thrift wear.`;

  return {
    title: product.title,
    description,
    keywords: [
      product.brand,
      product.category,
      "thrift",
      "premium",
      "branded",
    ].filter(Boolean).join(", "),
    openGraph: {
      title: `${product.title} | THRIFTX`,
      description,
      type: "website",
      images: [
        {
          url: product.primaryImage,
          width: 1200,
          height: 1500,
          alt: product.title,
        },
      ],
      url: `${siteConfig.url}/product/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | THRIFTX`,
      description,
      images: [product.primaryImage],
    },
    alternates: { canonical: `/product/${slug}` },
    robots: { index: true, follow: true },
  };
}

function getRetailPrice(price?: number): string {
  if (price == null) return "";
  return `₹${Math.round(price * 1.25).toLocaleString("en-IN")}`;
}

/**
 * ProductDetail — complete product details page.
 * Uses a consistent 1280px container, sticky desktop purchase panel,
 * mobile sticky bar, and premium below-the-fold sections.
 */
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
    `${product.title} from ${product.brand || "our curated collection"} is presented in ${product.condition ? product.condition.toLowerCase() : "excellent"
    } condition and ready to be styled with confidence.`;

  const retail = Number(String(retailPrice).replace(/[^\d]/g, ""));
  const discount = retail
    ? Math.round(((retail - product.price) / retail) * 100)
    : null;
  const savings = retail ? retail - product.price : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ||
      `${product.title} from ${product.brand || "THRIFTX"}`,
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

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-small text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          {product.category && (
            <>
              <Link
                href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`}
                className="transition-colors hover:text-foreground"
              >
                {product.category}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="font-medium text-foreground">{product.title}</span>
        </nav>

        {/* ── Main Grid ──────────────────────────────── */}
        <div className="grid gap-8 xl:grid-cols-[1.25fr_500px]">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-8">
            <ProductGallery
              title={product.title}
              primaryImage={product.primaryImage}
              images={product.images}
            />

            <TrustBadges />
          </div>

          {/* RIGHT COLUMN — Sticky Purchase Panel (desktop) */}
          <div className="xl:sticky xl:top-24 xl:h-fit">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      {product.brand || "THRIFTX"}
                    </p>
                    <h1 className="mt-2 text-display-md leading-[1.15] font-semibold text-foreground">
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

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-warning-bg px-3 py-1 text-small font-semibold text-warning-foreground">
                    Only 1 Left
                  </span>
                  <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">
                    Quality Checked
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-display-lg font-bold tracking-tight text-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {discount && discount > 0 && (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {retailPrice && (
                    <p className="text-body-sm text-muted-foreground">
                      MRP{" "}
                      <span className="ml-1 line-through">
                        {retailPrice}
                      </span>
                    </p>
                  )}
                  {savings && savings > 0 && (
                    <p className="text-body-sm font-semibold text-success">
                      You Save ₹
                      {savings.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                <p className="text-small text-muted-foreground">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Purchase actions + mobile sticky bar */}
              <ProductPurchasePanel product={product} />

              <hr className="border-border" />

              {/* Delivery + returns */}
              <DeliveryEstimate />

              {/* Measurements */}
              <ProductMeasurements product={product} />

              {/* Details */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <ProductDetails product={product} />
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </h3>
                <div className="space-y-3 text-body-sm leading-7 text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-success">✔</span>
                    <span>Premium thrift piece</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✔</span>
                    <span>Quality Checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✔</span>
                    <span>Freshly Sanitized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success">✔</span>
                    <span>Original Product Photos</span>
                  </div>
                  <p className="border-t border-border pt-3 text-muted-foreground">
                    {descriptionText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Below the fold ─────────────────────────── */}
        <div className="mt-12 space-y-6">
          <SizeRecommendation product={product} />
          <RecentlyViewedSection excludeSlug={product.slug} />
          <SimilarProductsSection product={product} />
          <CompleteTheLookSection product={product} />
        </div>
      </div>
    </>
  );
}
