import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Heart, Recycle, Shirt } from "lucide-react";

import { ContentPage } from "@/components/content/ContentPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "About THRIFTX",
    description:
        "Learn about THRIFTX: a Panipat-based destination for individually selected, quality-checked pre-loved fashion.",
    alternates: { canonical: "/about" },
};

const values = [
    {
        icon: Shirt,
        title: "One piece at a time",
        description:
            "Many items are unique finds, so product availability can change quickly. The product page shows the current listing.",
    },
    {
        icon: CheckCircle2,
        title: "Quality checked",
        description:
            "We inspect pieces before listing them and aim to describe the item clearly so you can make an informed choice.",
    },
    {
        icon: Recycle,
        title: "Wear it again",
        description:
            "Choosing pre-loved clothing is one way to give existing garments another chance in someone’s wardrobe.",
    },
];

export default function AboutPage() {
    return (
        <ContentPage
            eyebrow="Our story"
            title="Good finds deserve another life."
            description="THRIFTX makes discovering pre-loved branded fashion feel considered, clear, and easy."
        >
            <section className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-9">
                <div className="max-w-3xl">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Heart size={20} aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 font-display text-heading-3 font-bold text-foreground">
                        A more thoughtful way to find your next favourite.
                    </h2>
                    <p className="mt-3 text-body leading-relaxed text-muted-foreground">
                        Based in Panipat, Haryana, THRIFTX curates pre-loved clothing
                        for people who enjoy finding individual pieces without losing
                        sight of fit, condition, and value. We focus on clear product
                        details, secure checkout, and helpful support from discovery
                        through delivery.
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                {values.map(({ icon: Icon, title, description }) => (
                    <article
                        key={title}
                        className="rounded-2xl border border-border bg-card p-5"
                    >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                            <Icon size={19} aria-hidden="true" />
                        </span>
                        <h2 className="mt-4 font-display text-title font-semibold text-foreground">
                            {title}
                        </h2>
                        <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </article>
                ))}
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <h2 className="font-display text-title font-semibold text-foreground">
                        Find something that feels like you.
                    </h2>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                        Browse current pieces or ask our team a question.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="primary">
                        <Link href="/shop">Explore the shop</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/contact">Contact us</Link>
                    </Button>
                </div>
            </section>
        </ContentPage>
    );
}
