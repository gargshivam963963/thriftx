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
import RecentlyViewedTracker from "@/components/product/RecentlyViewedTracker";
import RecentlyViewedSection from "@/components/product/RecentlyViewedSection";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";
import SizeRecommendation from "@/components/product/SizeRecommendation";
import CompleteTheLookSection from "@/components/product/CompleteTheLookSection";
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
      <span className="text-body-sm text-muted-foreground">{icon} {label}</span>
      <span className="text-body-sm font-semibold text-foreground">{value}</span>
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
      <RecentlyViewedTracker product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-small text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span className="text-muted">/</span>
        <Link href="/shop" className="transition-colors hover:text-foreground">Shop</Link>
        <span className="text-muted">/</span>
        {product.category && (
          <>
            <Link href={`/shop/${product.gender.toLowerCase()}/${product.categorySlug}`} className="transition-colors hover:text-foreground">{product.category}</Link>
            <span className="text-muted">/</span>
          </>
        )}
        <span className="font-medium text-foreground">{product.title}</span>
      </nav>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_500px]">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <ProductGallery title={product.title} primaryImage={product.primaryImage} images={product.images} />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <ShieldCheck className="h-6 w-6 text-success" />
              <div>
                <p className="text-body font-semibold text-foreground">100% Authentic</p>
                <p className="text-small text-muted-foreground">Quality Checked</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <RotateCcw className="h-6 w-6 text-warning" />
              <div>
                <p className="text-body font-semibold text-foreground">7 Days Returns</p>
                <p className="text-small text-muted-foreground">Easy Returns</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4 bg-card">
              <PackageCheck className="h-6 w-6 text-info" />
              <div>
                <p className="text-body font-semibold text-foreground">Secure Packaging</p>
                <p className="text-small text-muted-foreground">Safe Delivery</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4 bg-card">
              <Truck className="h-6 w-6 text-info" />
              <div>
                <p className="text-body font-semibold text-foreground">Pan India Shipping</p>
                <p className="text-small text-muted-foreground">Fast &amp; Reliable</p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN - Sticky sidebar */}
        <div className="sticky top-24 h-fit space-y-6 rounded-3xl p-2">
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.28em] text-muted-foreground">{product.brand || "THRIFTX"}</p>
                <div className="mt-2 text-display-md leading-[1.15] font-semibold text-foreground max-w-[16ch]">{product.title}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <WishlistButton productId={product.id} />
                <ShareButton title={product.title} price={product.price} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-warning-bg px-3 py-1 text-small font-semibold text-warning-foreground">Only 1 Left</span>
              <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">Quality Checked</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col items-start gap-2">
              <span className="text-display-lg font-bold tracking-tight text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
              {discount && <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">{discount}% OFF</span>}
            </div>
            {retailPrice && (
              <div className="flex items-center gap-3">
                <p className="text-body-sm text-muted-foreground">MRP <span className="ml-1 line-through">{retailPrice}</span></p>
                {savings && <p className="text-body-sm font-semibold text-success">You Save ₹{savings.toLocaleString("en-IN")}</p>}
              </div>
            )}
            <p className="text-small text-muted-foreground">Inclusive of all taxes</p>
          </div>
          <hr className="border-border" />
          <ProductActions product={product} />
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-none">
            <h3 className="mb-5 text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">Product Information</h3>
            <div className="divide-y divide-border">
              {product.size && <InfoRow icon="📏" label="Size" value={product.size} />}
              {product.chest && <InfoRow icon="📐" label="Chest" value={product.chest} />}
              {product.waist && <InfoRow icon="📐" label="Waist" value={product.waist} />}
              {product.length && <InfoRow icon="📏" label="Length" value={product.length} />}
              {product.inseam && <InfoRow icon="📍" label="Inseam" value={`${product.inseam}"`} />}
              {product.color && <InfoRow icon="🎨" label="Color" value={product.color} />}
              {product.material && <InfoRow icon="🧵" label="Material" value={product.material} />}
              {product.condition && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-body-sm text-muted-foreground">Condition</span>
                  <span className="rounded-full bg-success-bg px-3 py-1 text-small font-semibold text-success-foreground">{product.condition}</span>
                </div>
              )}
            </div>
          </Card>
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-none">
            <h3 className="mb-5 text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">Description</h3>
            <div className="space-y-3 text-body-sm leading-7 text-foreground">
              <div className="flex items-center gap-2"><span className="text-success">✔</span><span>Premium thrift piece</span></div>
              <div className="flex items-center gap-2"><span className="text-success">✔</span><span>Quality Checked</span></div>
              <div className="flex items-center gap-2"><span className="text-success">✔</span><span>Freshly Sanitized</span></div>
              <div className="flex items-center gap-2"><span className="text-success">✔</span><span>Original Product Photos</span></div>
              <p className="pt-3 border-t border-border text-muted-foreground">{descriptionText}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <SizeRecommendation product={product} />
        <RecentlyViewedSection excludeSlug={product.slug} />
        <SimilarProductsSection product={product} />
        <CompleteTheLookSection product={product} />
      </div>
    </Section>
  );
}