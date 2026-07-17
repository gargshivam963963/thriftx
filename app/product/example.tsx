import { notFound } from "next/navigation";

import Section from "@/components/ui/Section";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { getProductById } from "@/lib/appwrite/products";
import type { Product } from "@/types/product"; // <-- Change this path to your Product type

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

    const product: Product | null = await getProductById(id);

    if (!product) {
        notFound();
    }

    const retailPrice =
        product.retailPrice || getRetailPrice(product.price);

    const descriptionText =
        product.description ||
        `${product.title} from ${product.brand || "our curated collection"
        } is presented in ${product.condition
            ? product.condition.toLowerCase()
            : "excellent"
        } condition and ready to be styled with confidence.`;

    const measurements = product.measurements || {};

    const measurementRows = [
        {
            label: "Size",
            value:
                measurements.size ||
                product.category ||
                "Available on request",
        },
        {
            label: "Chest",
            value:
                measurements.chest ||
                "Available on request",
        },
        {
            label: "Length",
            value:
                measurements.length ||
                "Available on request",
        },
        {
            label: "Shoulders",
            value:
                measurements.shoulders ||
                "Available on request",
        },
    ];

    const shippingText =
        product.shippingInfo ||
        `${product.brand || "This piece"
        } is shipped with authenticity confirmation and a care note tailored to its condition.`;

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
                            href={`/shop?category=${encodeURIComponent(product.category)}`}
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

            <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr]">
                {/* LEFT */}
                <div className="space-y-8">
                    {/* Gallery */}

                    {/* Trust Cards */}
                </div>

                {/* RIGHT */}
                <div className="sticky top-24 h-fit space-y-8">
                    {/* Product Information */}

                    {/* Price */}

                    {/* Measurements */}

                    {/* Description */}

                    {/* Accordion */}

                    {/* Action Buttons */}
                </div>
            </div>

            {/* Related Products */}
        </Section>
    );
}