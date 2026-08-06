import type { Product } from "@/lib/services/products";

function parseMeasurement(value?: string) {
    if (!value) return null;
    const numeric = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
}

function getRecommendation(product: Product) {
    const topwearKeywords = ["t-shirt", "shirt", "hoodie", "jacket", "blazer", "sweater", "top", "blouse", "cardigan", "vest", "jersey"];
    const bottomwearKeywords = ["jeans", "cargo", "trouser", "short", "skirt", "lower", "pant", "chino", "jogger", "legging"];

    const normalized = (product.category || "").toLowerCase();
    const usesChest = topwearKeywords.some((keyword) => normalized.includes(keyword));
    const usesWaist = bottomwearKeywords.some((keyword) => normalized.includes(keyword));

    const chest = parseMeasurement(product.chest);
    const waist = parseMeasurement(product.waist);
    const measurement = usesChest ? chest : usesWaist ? waist : chest ?? waist;

    if (!measurement) {
        return {
            label: "Regular Fit M",
            confidence: 0.58,
            detail: "We recommend a versatile medium fit while we gather more sizing details.",
        };
    }

    if (measurement >= 48) {
        return {
            label: "Fits Like XL",
            confidence: 0.91,
            detail: "This piece is best suited for a roomy, generous fit.",
        };
    }

    if (measurement >= 42) {
        return {
            label: "Regular Fit L",
            confidence: 0.87,
            detail: "A classic relaxed fit works well for this size range.",
        };
    }

    if (measurement >= 36) {
        return {
            label: "Oversized M",
            confidence: 0.82,
            detail: "This style is comfortable and slightly relaxed through the body.",
        };
    }

    return {
        label: "Slim Fit XL",
        confidence: 0.76,
        detail: "This cut feels more tailored, so a smaller fit may be most flattering.",
    };
}

export default function SizeRecommendation({ product }: { product: Product }) {
    const recommendation = getRecommendation(product);

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-badge font-semibold uppercase tracking-widest text-muted-foreground">
                        Size Recommendation
                    </p>
                    <h3 className="mt-1 text-heading-4 font-semibold text-foreground">
                        {recommendation.label}
                    </h3>
                </div>
                <div className="rounded-full bg-warning-bg px-3 py-1 text-body-sm font-semibold text-warning-foreground">
                    {Math.round(recommendation.confidence * 100)}% confidence
                </div>
            </div>

            <p className="mt-3 text-body leading-7 text-muted-foreground">
                {recommendation.detail}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
                {product.chest ? <span className="rounded-full bg-muted px-3 py-1 text-small font-medium text-muted-foreground">Chest {product.chest}</span> : null}
                {product.waist ? <span className="rounded-full bg-muted px-3 py-1 text-small font-medium text-muted-foreground">Waist {product.waist}</span> : null}
                {product.size ? <span className="rounded-full bg-muted px-3 py-1 text-small font-medium text-muted-foreground">Listed size {product.size}</span> : null}
            </div>
        </section>
    );
}
