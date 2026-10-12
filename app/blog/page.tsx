import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";

import { ContentPage } from "@/components/content/ContentPage";
import { blogPosts, type BlogPost } from "@/lib/content/blog";

export const metadata: Metadata = {
    title: "The THRIFTX Blog",
    description:
        "Practical guides to finding, fitting, and caring for pre-loved clothing from the THRIFTX Blog.",
    alternates: { canonical: "/blog" },
};

/** Per-category accent so cards feel alive without images. */
const ACCENTS: Record<string, { chip: string; glow: string; ring: string }> = {
    authenticity: {
        chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        glow: "from-amber-500/20",
        ring: "group-hover:border-amber-500/40",
    },
    thrift: {
        chip: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
        glow: "from-violet-500/20",
        ring: "group-hover:border-violet-500/40",
    },
    fit: {
        chip: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
        glow: "from-sky-500/20",
        ring: "group-hover:border-sky-500/40",
    },
    care: {
        chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        glow: "from-emerald-500/20",
        ring: "group-hover:border-emerald-500/40",
    },
};

function accentFor(post: BlogPost) {
    return ACCENTS[post.accent ?? ""] ?? ACCENTS.thrift;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(`${value}T00:00:00`),
    );
}

function Meta({ post }: { post: BlogPost }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} aria-hidden="true" />
                {post.readTime}
            </span>
        </div>
    );
}

export default function BlogPage() {
    const [featured, ...rest] = blogPosts;
    const featuredAccent = accentFor(featured);

    return (
        <ContentPage
            eyebrow="The THRIFTX blog"
            title="A little more style, a little less guesswork."
            description="Useful notes on thrift shopping, fit, and caring for the pieces you choose."
        >
            {/* ── Featured / hero post ── */}
            {featured && (
                <article
                    className={`group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${featuredAccent.ring}`}
                >
                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${featuredAccent.glow} via-transparent to-transparent opacity-70`}
                    />
                    <div className="relative flex flex-col gap-4 p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-badge font-semibold text-background">
                                <Sparkles size={13} aria-hidden="true" />
                                Latest
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-1 text-badge font-semibold ${featuredAccent.chip}`}
                            >
                                {featured.category}
                            </span>
                        </div>
                        <h2 className="font-display text-heading-3 font-bold tracking-tight text-foreground sm:text-heading-2">
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="rounded-sm outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {featured.title}
                            </Link>
                        </h2>
                        <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
                            {featured.description}
                        </p>
                        <Meta post={featured} />
                        <div className="mt-1">
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-body-sm font-semibold text-background transition-opacity hover:opacity-90"
                            >
                                Read article
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </article>
            )}

            {/* ── Remaining posts ── */}
            {rest.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {rest.map((post) => {
                        const accent = accentFor(post);
                        return (
                            <article
                                key={post.slug}
                                className={`group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:p-6 ${accent.ring}`}
                            >
                                <span
                                    className={`w-fit rounded-full px-2.5 py-1 text-badge font-semibold ${accent.chip}`}
                                >
                                    {post.category}
                                </span>
                                <h3 className="mt-3 font-display text-heading-4 font-semibold text-foreground">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="rounded-sm outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="mt-2 flex-1 text-body-sm leading-relaxed text-muted-foreground">
                                    {post.description}
                                </p>
                                <div className="mt-4">
                                    <Meta post={post} />
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-foreground"
                                    >
                                        Read article
                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                            className="transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <p className="rounded-xl bg-muted/50 p-4 text-body-sm text-muted-foreground">
                We’ll add new blog posts as we publish them. For questions
                about a specific item, <Link href="/contact" className="font-semibold text-foreground underline underline-offset-4">contact our team</Link>.
            </p>
        </ContentPage>
    );
}
