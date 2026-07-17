import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronDown,
} from "lucide-react";

import { getProductById, Product } from "@/lib/products";
import ProductActions from "./ProductActions";

function getRetailPrice(price?: number): string {
  if (price == null) return '';

  return `₹${Math.round(price * 1.25).toLocaleString('en-IN')}`;
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: Product | null = await getProductById(id);

  if (!product) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-8 md:pt-16 pb-24">
        <div className="text-center py-24">Product not found.</div>
      </div>
    );
  }

  const retailPrice = product.retailPrice || getRetailPrice(product.price);
  const descriptionText = product.description || `${product.title} from ${product.brand || 'our curated collection'} is presented in ${product.condition ? product.condition.toLowerCase() : 'excellent'} condition and ready to be styled with confidence.`;
  const measurements = product.measurements || {};
  const measurementRows = [
    { label: 'Size', value: measurements.size || (product.category ? product.category : 'Available on request') },
    { label: 'Chest', value: measurements.chest || 'Available on request' },
    { label: 'Length', value: measurements.length || 'Available on request' },
    { label: 'Shoulders', value: measurements.shoulders || 'Available on request' },
  ];
  const shippingText = product.shippingInfo || `${product.brand || 'This piece'} is shipped with authenticity confirmation and a care note tailored to its condition.`;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 lg:px-12 lg:py-10">

      <div className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span className="text-black">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">

        {/* LEFT */}

        <div className="lg:col-span-7">

          <div className="flex gap-5">

            {/* thumbnails */}

            <div className="hidden md:flex flex-col gap-3">

              {[1, 2, 3, 4].map((item) => (
                <button
                  key={item}
                  className="relative h-24 w-20 overflow-hidden rounded-2xl border border-neutral-200 transition hover:border-black"
                >
                  <Image
                    src={product.image || "/assets/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}

            </div>

            {/* main image */}

            <div className="flex-1">

              <div className="relative overflow-hidden rounded-[28px] bg-neutral-100">

                <div className="absolute left-5 top-5 z-20 flex flex-col gap-2">

                  {product.onlyOneLeft && (
                    <span className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                      Only 1 Left
                    </span>
                  )}

                  <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold shadow backdrop-blur">

                    <BadgeCheck className="h-4 w-4 text-amber-500" />

                    Verified Authentic

                  </span>

                </div>

                <button className="absolute left-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition hover:scale-105">

                  <ChevronLeft className="h-5 w-5" />

                </button>

                <button className="absolute right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow transition hover:scale-105">

                  <ChevronRight className="h-5 w-5" />

                </button>

                <div className="relative aspect-[4/5] lg:aspect-[0.9]">

                  <Image
                    src={product.image || "/assets/placeholder.png"}
                    alt={product.title}
                    fill
                    priority
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                  />

                </div>

              </div>

              {/* mobile thumbnails */}

              <div className="mt-4 flex gap-3 overflow-x-auto md:hidden">

                {[1, 2, 3, 4].map((item) => (
                  <button
                    key={item}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={product.image || "/assets/placeholder.png"}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-8">

            {/* Brand */}

            <div className="space-y-4">

              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-700">
                {product.brand}
              </span>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-5xl">
                {product.title}
              </h1>

              {/* Rating */}

              <div className="flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}

                  <span className="ml-2 text-sm font-semibold">
                    4.9
                  </span>

                </div>

                <span className="text-sm text-neutral-500">

                  127 Reviews

                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                  Excellent Condition

                </span>

              </div>

            </div>

            {/* PRICE */}

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">

              <div className="flex items-end gap-4">

                <span className="text-4xl font-bold">

                  {product.price}

                </span>

                {retailPrice && (

                  <span className="text-lg text-neutral-400 line-through">

                    {retailPrice}

                  </span>

                )}

              </div>

              <div className="mt-3 flex flex-wrap gap-3">

                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">

                  Save 25%

                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">

                  Free Shipping

                </span>

              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-500">

                Inclusive of all taxes.
                Carefully inspected and authenticated before dispatch.

              </p>

            </div>

            {/* TRUST */}

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl border p-4">

                <ShieldCheck className="mb-3 h-6 w-6" />

                <p className="font-semibold">

                  100% Authentic

                </p>

                <p className="mt-1 text-sm text-neutral-500">

                  Verified before shipping.

                </p>

              </div>

              <div className="rounded-2xl border p-4">

                <Truck className="mb-3 h-6 w-6" />

                <p className="font-semibold">

                  Fast Delivery

                </p>

                <p className="mt-1 text-sm text-neutral-500">

                  Ships within 24 hours.

                </p>

              </div>

              <div className="rounded-2xl border p-4">

                <RotateCcw className="mb-3 h-6 w-6" />

                <p className="font-semibold">

                  Easy Returns

                </p>

                <p className="mt-1 text-sm text-neutral-500">

                  Hassle-free process.

                </p>

              </div>

              <div className="rounded-2xl border p-4">

                <BadgeCheck className="mb-3 h-6 w-6" />

                <p className="font-semibold">

                  Premium Quality

                </p>

                <p className="mt-1 text-sm text-neutral-500">

                  Handpicked imported thrift.

                </p>

              </div>

            </div>

            {/* ACTIONS */}

            <ProductActions product={product} />

            {/* MEASUREMENTS */}

            <div className="rounded-3xl border border-neutral-200 p-6">

              <h3 className="mb-5 text-lg font-semibold">

                Measurements

              </h3>

              <div className="space-y-4">

                {measurementRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b pb-3 last:border-none"
                  >

                    <span className="text-neutral-500">

                      {row.label}

                    </span>

                    <span className="font-semibold">

                      {row.value}

                    </span>

                  </div>
                ))}

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="rounded-3xl border border-neutral-200">

              <details
                open
                className="group"
              >

                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold">

                  Description

                  <ChevronDown className="transition group-open:rotate-180" />

                </summary>

                <div className="px-6 pb-6 text-neutral-600 leading-7">

                  {descriptionText}

                </div>

              </details>

              <details className="border-t group">

                <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-semibold">

                  Shipping & Returns

                  <ChevronDown className="transition group-open:rotate-180" />

                </summary>

                <div className="px-6 pb-6 text-neutral-600 leading-7">

                  {shippingText}

                </div>

              </details>

            </div>

            {/* SHARE */}

            <div className="flex gap-4">

              <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border transition hover:bg-black hover:text-white">

                <Heart className="h-5 w-5" />

                Wishlist

              </button>

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:bg-black hover:text-white">

                <Share2 className="h-5 w-5" />

              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}