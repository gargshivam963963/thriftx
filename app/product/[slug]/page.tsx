import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import {
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/card";
import Accordion from "@/components/ui/Accordion";

import ProductGallery from "@/components/product/ProductGallery";

import {
  getProductBySlug,
  Product,
} from "@/lib/services/products";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";
import DetailRow from "@/components/ui/DetailRow";
import ProductActions from "@/app/product/[slug]/ProductActions";
import ProductViewTracker from "@/app/product/[slug]/ProductViewTracker";
import { siteConfig } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description:
      product.description ||
      `${product.title} from ${product.brand || "THRIFTX"} — Premium branded thrift wear.`,
    openGraph: {
      title: `${product.title} | THRIFTX`,
      description:
        product.description ||
        `Shop ${product.title} from THRIFTX. Premium thrift.`,
      images: [{ url: product.primaryImage, width: 1200, height: 1500 }],
      url: `${siteConfig.url}/product/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | THRIFTX`,
      description:
        product.description ||
        `Shop ${product.title} from THRIFTX. Premium thrift.`,
      images: [product.primaryImage],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function getRetailPrice(price?: number): string {
  if (price == null) return "";

  return `₹${Math.round(price * 1.25).toLocaleString("en-IN")}`;
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const retailPrice =
    product.retailPrice ??
    getRetailPrice(product.price);

  const descriptionText =
    product.description ||
    `${product.title} from ${product.brand || "our curated collection"
    } is presented in ${product.condition
      ? product.condition.toLowerCase()
      : "excellent"
    } condition and ready to be styled with confidence.`;

  const shippingText =
    product.shippingInfo ||
    `${product.brand || "This piece"
    } is shipped with authenticity confirmation and a care note tailored to its condition.`;

  const retail = Number(
    String(retailPrice).replace(/[^\d]/g, ""),
  );

  const discount = retail
    ? Math.round(
      ((retail - product.price) / retail) * 100,
    )
    : null;

  const savings = retail
    ? retail - product.price
    : null;
  console.log(product, "product");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ||
      `${product.title} from ${product.brand || "THRIFTX"}`,
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
    <Section className="pt-8 pb-16">
      <ProductViewTracker product={product} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-small text-neutral-500"
      >
        <Link
          href="/"
          className="transition-colors hover:text-black"
        >
          Home
        </Link>

        <span>/</span>

        <Link
          href="/shop"
          className="transition-colors hover:text-black"
        >
          Shop
        </Link>

        <span>/</span>

        {product.category && (
          <>
            <Link
              href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`}
              className="transition-colors hover:text-black"
            >
              {product.category}
            </Link>

            <span>/</span>
          </>
        )}

        <span className="font-medium text-black">
          {product.title}
        </span>
      </nav>

      <div className="grid gap-10 xl:grid-cols-[1.35fr_430px]">
        {/* LEFT */}
        <div className="space-y-8">
          <ProductGallery
            title={product.title}
            primaryImage={product.primaryImage}
            images={product.images}
          />

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card className="flex items-center gap-4 rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />

              <div>
                <p className="text-sm font-semibold">
                  100% Authentic
                </p>

                <p className="text-xs text-neutral-500">
                  Quality Checked
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <RotateCcw className="h-6 w-6 text-orange-500" />

              <div>
                <p className="text-sm font-semibold">
                  7 Days Returns
                </p>

                <p className="text-xs text-neutral-500">
                  Easy Returns
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-4">
              <PackageCheck className="h-6 w-6 text-indigo-600" />

              <div>
                <p className="text-sm font-semibold">
                  Secure Packaging
                </p>

                <p className="text-xs text-neutral-500">
                  Safe Delivery
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-4">
              <Truck className="h-6 w-6 text-blue-600" />

              <div>
                <p className="text-sm font-semibold">
                  Pan India Shipping
                </p>

                <p className="text-xs text-neutral-500">
                  Fast & Reliable
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT */}
        <div className="sticky top-24 h-fit space-y-6 rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-400">
                  {product.brand || "THRIFTX"}
                </p>

                <div className="mt-2 text-[2rem] leading-[1.15] font-semibold text-neutral-900 max-w-[16ch]">
                  {product.title}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <WishlistButton
                  productId={product.id}
                />

                <ShareButton
                  title={product.title}
                  price={product.price}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                🔥 Only 1 Left
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✔ Quality Checked
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-3">

            <div className="flex flex-col items-start gap-2">
              <span className="text-5xl font-bold tracking-tight text-neutral-950">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {discount && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {discount}% OFF
                </span>
              )}

            </div>

            {retailPrice && (
              <div className="flex items-center gap-3">

                <p className="text-neutral-500">
                  MRP
                  <span className="ml-1 line-through">
                    {retailPrice}
                  </span>
                </p>

                {savings && (
                  <p className="font-semibold text-emerald-600">
                    You Save ₹{savings.toLocaleString("en-IN")}
                  </p>
                )}

              </div>
            )}

            <p className="text-xs text-neutral-400">
              Inclusive of all taxes
            </p>

          </div>

          <hr className="border-neutral-200" />

          {/* Actions */}
          <ProductActions product={product} />

          {/* Product Information */}
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-none">

            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Product Information
            </h3>

            <div className="divide-y divide-neutral-100">

              {product.size && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">📏 Size</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.size}
                  </span>
                </div>
              )}

              {product.chest && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">📐 Chest</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.chest}
                  </span>
                </div>
              )}

              {product.waist && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">📐 Waist</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.waist}
                  </span>
                </div>
              )}

              {product.length && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">📏 Length</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.length}
                  </span>
                </div>
              )}

              {product.inseam && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">📍 Inseam</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.inseam}"
                  </span>
                </div>
              )}

              {product.color && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">🎨 Color</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.color}
                  </span>
                </div>
              )}

              {product.material && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">🧵 Material</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {product.material}
                  </span>
                </div>
              )}

              {product.condition && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500">✨ Condition</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {product.condition}
                  </span>
                </div>
              )}

            </div>

          </Card>

          {/* Description */}
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-none">

            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Description
            </h3>

            <div className="space-y-3 text-sm leading-7 text-neutral-600">

              <div className="flex items-center gap-2">
                <span>✔</span>
                <span>Premium thrift piece</span>
              </div>

              <div className="flex items-center gap-2">
                <span>✔</span>
                <span>Quality Checked</span>
              </div>

              <div className="flex items-center gap-2">
                <span>✔</span>
                <span>Freshly Sanitized</span>
              </div>

              <div className="flex items-center gap-2">
                <span>✔</span>
                <span>Original Product Photos</span>
              </div>

              <p className="pt-3 border-t border-neutral-100">
                {descriptionText}
              </p>

            </div>

          </Card>
        </div>
      </div>

      {/* TODO: Related Products */}
    </Section>
  );
}