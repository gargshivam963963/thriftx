import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import ProductGallery from "@/components/product/ProductGallery";
import { getProductBySlug } from "@/lib/services/products";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";
import ProductActions from "@/app/product/[slug]/ProductActions";
import ProductViewTracker from "@/app/product/[slug]/ProductViewTracker";
import { siteConfig } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description || `${product.title} from ${product.brand || "THRIFTX"} - Premium branded thrift wear.`,
    openGraph: {
      title: `${product.title} | THRIFTX`,
      description: product.description || `Shop ${product.title} from THRIFTX. Premium thrift.`,
      images: [{ url: product.primaryImage, width: 1200, height: 1500 }],
      url: `${siteConfig.url}/product/${slug}`,
    },
    twitter: { card: "summary_large_image", title: `${product.title} | THRIFTX`, description: product.description || `Shop ${product.title} from THRIFTX. Premium thrift.`, images: [product.primaryImage] },
    alternates: { canonical: `/product/${slug}` },
    robots: { index: true, follow: true },
  };
}

function getRetailPrice(price?: number): string {
  if (price == null) return "";
  return `₹${Math.round(price * 1.25).toLocaleString("en-IN")}`;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{icon} {label}</span>
      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{value}</span>
    </div>
  );
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const retailPrice = product.retailPrice ?? getRetailPrice(product.price);
  const descriptionText = product.description || `${product.title} from ${product.brand || "our curated collection"} is presented in ${product.condition ? product.condition.toLowerCase() : "excellent"} condition and ready to be styled with confidence.`;
  const retail = Number(String(retailPrice).replace(/[^\d]/g, ""));
  const discount = retail ? Math.round(((retail - product.price) / retail) * 100) : null;
  const savings = retail ? retail - product.price : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} from ${product.brand || "THRIFTX"}`,
    image: product.primaryImage,
    brand: { "@type": "Brand", name: product.brand || "THRIFTX" },
    offers: { "@type": "Offer", price: product.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${siteConfig.url}/product/${product.slug}` },
    category: product.category, material: product.material, color: product.color,
  };

  return (
    <Section className="pt-8 pb-16">
      <ProductViewTracker product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-small text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">Home</Link>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        <Link href="/shop" className="transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">Shop</Link>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        {product.category && (
          <>
            <Link href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`} className="transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">{product.category}</Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
          </>
        )}
        <span className="font-medium text-neutral-900 dark:text-white">{product.title}</span>
      </nav>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_500px]">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <ProductGallery title={product.title} primaryImage={product.primaryImage} images={product.images} />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card className="flex items-center gap-4 rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-750">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold dark:text-white">100% Authentic</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Quality Checked</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-750">
              <RotateCcw className="h-6 w-6 text-orange-500 dark:text-orange-400" />
              <div>
                <p className="text-sm font-semibold dark:text-white">7 Days Returns</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Easy Returns</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4 dark:bg-neutral-800 dark:border-neutral-700">
              <PackageCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold dark:text-white">Secure Packaging</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Safe Delivery</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4 dark:bg-neutral-800 dark:border-neutral-700">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold dark:text-white">Pan India Shipping</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Fast &amp; Reliable</p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN - Sticky sidebar */}
        <div className="sticky top-24 h-fit space-y-6 rounded-3xl p-2 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none">
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">{product.brand || "THRIFTX"}</p>
                <div className="mt-2 text-[2rem] leading-[1.15] font-semibold text-neutral-900 dark:text-white max-w-[16ch]">{product.title}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <WishlistButton productId={product.id} />
                <ShareButton title={product.title} price={product.price} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Only 1 Left</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">Quality Checked</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col items-start gap-2">
              <span className="text-5xl font-bold tracking-tight text-neutral-950 dark:text-white">₹{product.price.toLocaleString("en-IN")}</span>
              {discount && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">{discount}% OFF</span>}
            </div>
            {retailPrice && (
              <div className="flex items-center gap-3">
                <p className="text-neutral-500 dark:text-neutral-400">MRP <span className="ml-1 line-through">{retailPrice}</span></p>
                {savings && <p className="font-semibold text-emerald-600 dark:text-emerald-400">You Save ₹{savings.toLocaleString("en-IN")}</p>}
              </div>
            )}
            <p className="text-xs text-neutral-400 dark:text-neutral-500">Inclusive of all taxes</p>
          </div>
          <hr className="border-neutral-200 dark:border-neutral-700" />
          <ProductActions product={product} />
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-none dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Product Information</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {product.size && <InfoRow icon="📏" label="Size" value={product.size} />}
              {product.chest && <InfoRow icon="📐" label="Chest" value={product.chest} />}
              {product.waist && <InfoRow icon="📐" label="Waist" value={product.waist} />}
              {product.length && <InfoRow icon="📏" label="Length" value={product.length} />}
              {product.inseam && <InfoRow icon="📍" label="Inseam" value={`${product.inseam}"`} />}
              {product.color && <InfoRow icon="🎨" label="Color" value={product.color} />}
              {product.material && <InfoRow icon="🧵" label="Material" value={product.material} />}
              {product.condition && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Condition</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">{product.condition}</span>
                </div>
              )}
            </div>
          </Card>
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-none dark:bg-neutral-800 dark:border-neutral-700">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Description</h3>
            <div className="space-y-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2"><span className="text-emerald-500 dark:text-emerald-400">✔</span><span>Premium thrift piece</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-500 dark:text-emerald-400">✔</span><span>Quality Checked</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-500 dark:text-emerald-400">✔</span><span>Freshly Sanitized</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-500 dark:text-emerald-400">✔</span><span>Original Product Photos</span></div>
              <p className="pt-3 border-t border-neutral-100 dark:border-neutral-700 dark:text-neutral-400">{descriptionText}</p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}