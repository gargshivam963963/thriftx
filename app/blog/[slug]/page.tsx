import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";

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
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            type: "article",
            title: post.title,
            description: post.description,
            publishedTime: new Date(`${post.publishedAt}T00:00:00Z`).toISOString(),
            authors: ["THRIFTX"],
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
                </div>
                <p className="mt-5 text-body leading-relaxed text-foreground">
                    {post.introduction}
                </p>
                <div className="mt-6 space-y-7">
                    {post.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="font-display text-heading-4 font-semibold text-foreground">
                                {section.heading}
                            </h2>
                            <div className="mt-2 space-y-3 text-body-sm leading-relaxed text-muted-foreground">
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                                {section.points && (
                                    <ul className="space-y-2 pl-5">
                                        {section.points.map((point) => (
                                            <li key={point} className="list-disc">
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/blog"
                        className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-foreground"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back to the journal
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex min-h-11 items-center text-body-sm font-semibold text-foreground underline underline-offset-4"
                    >
                        Browse current finds
                    </Link>
                </div>
            </article>
        </ContentPage>
    );
}
