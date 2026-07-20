import { notFound } from "next/navigation";
import Link from "next/link";

import {
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Accordion from "@/components/ui/Accordion";

import ProductGallery from "@/components/product/ProductGallery";

import {
  getProductById,
  Product,
} from "@/lib/services/products";
import ProductActions from "@/app/product/[id]/ProductActions";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";

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

  const savings = retail
    ? retail - product.price
    : null;

  function Row({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div className="flex items-center justify-between border-b border-neutral-100 py-[10px] last:border-none">
        <span className="text-[13px] font-medium text-neutral-500">
          {label}
        </span>

        <span className="text-[15px] font-semibold text-neutral-900">
          {value}
        </span>
      </div>
    );
  }

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
        <div className="sticky top-24 h-fit space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-neutral-400">
                  {product.brand || "THRIFTX"}
                </p>

                <h1 className="mt-1 text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-neutral-950 xl:text-[46px]">
                  {product.title}
                </h1>
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

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium tracking-tight text-neutral-700">
                🔥 Only 1 Piece Left
              </span>

              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium tracking-tight text-neutral-700">
                ✔ Quality Checked
              </span>

              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium tracking-tight text-neutral-700">
                🧼 Sanitized
              </span>

              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium text-neutral-700">
                📷 Original Photos
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">

            <div className="flex items-end gap-3">

              <span className="text-[48px] font-bold leading-none tracking-[-0.06em] text-neutral-950">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

            </div>

            {savings !== null && (
              <p className="text-sm font-semibold text-emerald-600">
                Save ₹{savings.toLocaleString("en-IN")}
              </p>
            )}

            {retailPrice && (
              <p className="text-sm text-neutral-500">
                MRP{" "}
                <span className="line-through">
                  {retailPrice}
                </span>
              </p>
            )}

            <p className="text-xs font-medium text-neutral-400">
              Inclusive of all taxes
            </p>

          </div>

          {/* Actions */}
          <ProductActions product={product} />

          {/* Delivery */}
          <Card className="rounded-2xl border p-5 shadow-none">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />

                <p className="text-[13px] font-semibold tracking-tight text-neutral-900">
                  Check Delivery
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter delivery pincode"
                  className="h-11 flex-1 rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-neutral-900"
                />

                <Button size="sm">
                  Check
                </Button>
              </div>

              <p className="text-[11px] text-neutral-400">
                Enter your delivery pincode to see the delivery estimate.
              </p>

            </div>
          </Card>

          {/* Product Details */}
          <Card className="rounded-2xl border shadow-none">

            <div className="p-4">
              <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Product Details
              </h3>

              <div className="space-y-2">
                {product.size && (
                  <Row
                    label="Fits Like"
                    value={product.size}
                  />
                )}

                {product.chest && (
                  <Row
                    label="Chest"
                    value={`${product.chest}"`}
                  />
                )}

                {product.color && (
                  <Row
                    label="Color"
                    value={product.color}
                  />
                )}
              </div>

            </div>
            <Accordion
              type="single"
              collapsible
              items={[
                {
                  value: "more",
                  title: "View Complete Specifications",
                  content: (
                    <div className="space-y-3 pt-2">

                      {product.waist && (
                        <Row
                          label="Waist"
                          value={`${product.waist}"`}
                        />
                      )}

                      {product.length && (
                        <Row
                          label="Length"
                          value={`${product.length}"`}
                        />
                      )}

                      {product.inseam && (
                        <Row
                          label="Inseam"
                          value={`${product.inseam}"`}
                        />
                      )}

                      {product.material && (
                        <Row
                          label="Material"
                          value={product.material}
                        />
                      )}

                      {product.condition && (
                        <Row
                          label="Condition"
                          value={product.condition}
                        />
                      )}

                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Description & Shipping */}
          <Accordion
            type="single"
            collapsible
            items={[
              {
                value: "description",
                title: "Description",
                content: (
                  <div className="space-y-3 text-sm text-neutral-600">
                    <p>• Premium thrift piece</p>
                    <p>• Washed & Sanitized</p>
                    <p>• Quality Checked</p>
                    <p>• Original Photos</p>
                    <p>{descriptionText}</p>
                  </div>
                ),
              },
              {
                value: "delivery",
                title: "Delivery & Returns",
                content: (
                  <div className="space-y-3 text-sm text-neutral-600">
                    <p>{shippingText}</p>

                    <p>
                      ✔ Same-Day Delivery in Panipat
                    </p>

                    <p>
                      ✔ Pan India Shipping Available
                    </p>

                    <p>
                      ✔ Easy Returns Available
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* TODO: Related Products */}
    </Section>
  );
}