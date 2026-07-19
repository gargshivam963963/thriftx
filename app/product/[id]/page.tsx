import { notFound } from "next/navigation";
import Link from "next/link";

import {
  Heart,
  PackageCheck,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Accordion from "@/components/ui/Accordion";
import IconButton from "@/components/ui/IconButton";
import { Button } from "@/components/ui/button";

import ProductGallery from "@/components/product/ProductGallery";

import {
  getProductById,
  Product,
} from "@/lib/services/products";
import ProductActions from "@/app/product/[id]/ProductActions";

function getRetailPrice(price?: number): string {
  if (price == null) return "";

  return `₹${Math.round(price * 1.25).toLocaleString("en-IN")}`;
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product: Product | null =
    await getProductById(id);

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

  return (
    <Section className="pt-8 pb-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-sm text-neutral-500"
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr]">
        {/* LEFT */}
        <div className="space-y-8">
          <ProductGallery
            title={product.title}
            primaryImage={product.primaryImage}
            images={product.images}
          />

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card className="flex items-center gap-3 p-4">
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

            <Card className="flex items-center gap-3 p-4">
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
        <div className="sticky top-24 h-fit space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-500">
                  {product.brand || "THRIFTX"}
                </p>

                <h1 className="mt-2 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-neutral-900 xl:text-[42px]">
                  {product.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <IconButton
                  aria-label="Wishlist"
                  variant="outline"
                >
                  <Heart className="h-5 w-5" />
                </IconButton>

                <IconButton
                  aria-label="Share"
                  variant="outline"
                >
                  <Share2 className="h-5 w-5" />
                </IconButton>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 text-[15px]">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                <span className="font-medium">
                  4.9
                </span>

                <span className="text-neutral-500">
                  (127 Reviews)
                </span>
              </div>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {product.condition || "Excellent"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-end gap-3">
              <span className="text-[40px] font-semibold leading-none tracking-tight">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {retailPrice && (
                <span className="pb-1 text-lg font-medium text-neutral-400 line-through">
                  {retailPrice}
                </span>
              )}

              {discount !== null && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-500">
              Inclusive of all taxes
            </p>
          </div>

          {/* Condition */}
          <Card className="rounded-2xl border p-5 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Condition
                </p>

                <p className="mt-2 text-lg font-semibold text-emerald-600">
                  {product.condition || "Excellent"}
                </p>

                <p className="mt-2 text-sm text-neutral-600">
                  {product.description ||
                    "Carefully inspected. Minor signs of wear but excellent overall."}
                </p>
              </div>

              <ShieldCheck className="h-7 w-7 text-neutral-500" />
            </div>
          </Card>

          {/* Measurements */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">
              Size & Measurements
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-x-10 border-b border-neutral-200 pb-4">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-neutral-600">
                    Size
                  </span>

                  <span className="font-semibold">
                    {product.size || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-neutral-600">
                    Length
                  </span>

                  <span className="font-semibold">
                    {product.length || "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-neutral-600">
                    Chest
                  </span>

                  <span className="font-semibold">
                    {product.chest || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-neutral-600">
                    Waist
                  </span>

                  <span className="font-semibold">
                    {product.waist || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
              <span>
                All measurements are in inches
              </span>

              <button className="underline underline-offset-4">
                Size Guide
              </button>
            </div>
          </div>
          {/* Description & Shipping */}
          <Accordion
            type="single"
            collapsible
            items={[
              {
                value: "description",
                title: "Description",
                content: (
                  <p className="leading-7 text-neutral-600">
                    {descriptionText}
                  </p>
                ),
              },
              {
                value: "shipping",
                title: "Shipping",
                content: (
                  <p className="leading-7 text-neutral-600">
                    {shippingText}
                  </p>
                ),
              },
            ]}
          />

          {/* Actions */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* TODO: Related Products */}
    </Section>
  );
}