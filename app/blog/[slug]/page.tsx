import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Lightbulb,
} from "lucide-react";

import { ContentPage } from "@/components/content/ContentPage";
import { blogPosts, getBlogPost } from "@/lib/content/blog";
import { siteConfig } from "@/lib/seo";

export function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);
    if (!post) return { title: "Article not found" };

    return {
        title: post.title,
        description: post.description,
        keywords: post.tags,
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            type: "article",
            title: post.title,
            description: post.description,
            publishedTime: new Date(`${post.publishedAt}T00:00:00Z`).toISOString(),
            authors: ["THRIFTX"],
            tags: post.tags,
        },
    };
}

export default async function BlogArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getBlogPost(slug);
    if (!post) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        keywords: post.tags?.join(", "),
        articleSection: post.category,
        datePublished: new Date(`${post.publishedAt}T00:00:00Z`).toISOString(),
        dateModified: new Date(`${post.publishedAt}T00:00:00Z`).toISOString(),
        author: { "@type": "Organization", name: siteConfig.name },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    };

    return (
        <ContentPage
            eyebrow={post.category}
            title={post.title}
            description={post.description}
        >
            <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                    }}
                />
                {/* Meta bar + tag chips */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4 text-small text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} aria-hidden="true" />
                        {new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                        }).format(new Date(`${post.publishedAt}T00:00:00`))}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={14} aria-hidden="true" />
                        {post.readTime}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
                                <li
                                    key={tag}
                                    className="rounded-full bg-muted px-2.5 py-0.5 text-badge font-medium text-muted-foreground"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Introduction — larger, leading paragraph */}
                <p className="mt-6 text-body-lg font-medium leading-relaxed text-foreground">
                    {post.introduction}
                </p>

                {/* Top callout */}
                {post.callout && (
                    <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                        <Lightbulb
                            size={18}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-body-sm font-semibold text-foreground">
                                {post.callout.title}
                            </p>
                            <p className="mt-1 text-body-sm leading-relaxed text-muted-foreground">
                                {post.callout.text}
                            </p>
                        </div>
                    </aside>
                )}

                <div className="mt-8 space-y-8">
                    {post.sections.map((section, index) => (
                        <section key={section.heading}>
                            <div className="flex items-start gap-3">
                                <span
                                    aria-hidden="true"
                                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-badge font-bold text-background"
                                >
                                    {index + 1}
                                </span>
                                <h2 className="font-display text-heading-4 font-semibold text-foreground">
                                    {section.heading.replace(/^\d+\.\s*/, "")}
                                </h2>
                            </div>
                            <div className="mt-2 space-y-3 pl-10 text-body-sm leading-relaxed text-muted-foreground">
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                                {section.points && (
                                    <ul className="space-y-2">
                                        {section.points.map((point) => (
                                            <li
                                                key={point}
                                                className="flex items-start gap-2"
                                            >
                                                <CheckCircle2
                                                    size={16}
                                                    className="mt-0.5 shrink-0 text-success"
                                                    aria-hidden="true"
                                                />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {section.callout && (
                                    <aside className="mt-3 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                        <Lightbulb
                                            size={18}
                                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                                            aria-hidden="true"
                                        />
                                        <div>
                                            <p className="text-body-sm font-semibold text-foreground">
                                                {section.callout.title}
                                            </p>
                                            <p className="mt-1 text-body-sm leading-relaxed text-muted-foreground">
                                                {section.callout.text}
                                            </p>
                                        </div>
                                    </aside>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
                {/* CTA + navigation */}
                <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground/[0.04] to-transparent p-6 sm:p-8">
                    <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                        Ready to shop?
                    </p>
                    <h2 className="mt-1 font-display text-heading-4 font-bold text-foreground">
                        Every find is authenticated and one of a kind.
                    </h2>
                    <p className="mt-2 max-w-xl text-body-sm leading-relaxed text-muted-foreground">
                        Browse the current drop of hand-checked branded thrift —
                        photographed in detail so you know exactly what
                        you&rsquo;re getting.
                    </p>
                    <Link
                        href="/shop"
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-body-sm font-semibold text-background transition-opacity hover:opacity-90"
                    >
                        Browse current finds
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-6 border-t border-border pt-5">
                    <Link
                        href="/blog"
                        className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-foreground"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back to the blog
                    </Link>
                </div>
            </article>
        </ContentPage>
    );
}
