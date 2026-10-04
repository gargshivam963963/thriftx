import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

import { ContentPage } from "@/components/content/ContentPage";
import { blogPosts } from "@/lib/content/blog";

export const metadata: Metadata = {
    title: "The THRIFTX Journal",
    description:
        "Practical guides to finding, fitting, and caring for pre-loved clothing from the THRIFTX Journal.",
    alternates: { canonical: "/blog" },
};

export default function BlogPage() {
    return (
        <ContentPage
            eyebrow="The THRIFTX journal"
            title="A little more style, a little less guesswork."
            description="Useful notes on thrift shopping, fit, and caring for the pieces you choose."
        >
            <div className="grid gap-4 md:grid-cols-2">
                {blogPosts.map((post) => (
                    <article
                        key={post.slug}
                        className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-card sm:p-6"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-small text-muted-foreground">
                            <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground">
                                {post.category}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} aria-hidden="true" />
                                {new Intl.DateTimeFormat("en-IN", {
                                    dateStyle: "medium",
                                }).format(new Date(`${post.publishedAt}T00:00:00`))}
                            </span>
                        </div>
                        <h2 className="mt-4 font-display text-heading-4 font-semibold text-foreground sm:text-title">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="rounded-sm outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {post.title}
                            </Link>
                        </h2>
                        <p className="mt-2 flex-1 text-body-sm leading-relaxed text-muted-foreground">
                            {post.description}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                            <span className="inline-flex items-center gap-1.5 text-small text-muted-foreground">
                                <Clock3 size={14} aria-hidden="true" />
                                {post.readTime}
                            </span>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-foreground"
                            >
                                Read article
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
            <p className="rounded-xl bg-muted/50 p-4 text-body-sm text-muted-foreground">
                We’ll add new journal entries as we publish them. For questions
                about a specific item, <Link href="/contact" className="font-semibold text-foreground underline underline-offset-4">contact our team</Link>.
            </p>
        </ContentPage>
    );
}
