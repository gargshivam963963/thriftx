import type { ReactNode } from "react";

interface ContentPageProps {
    eyebrow: string;
    title: string;
    description: string;
    updatedAt?: string;
    children: ReactNode;
}

export function ContentPage({
    eyebrow,
    title,
    description,
    updatedAt,
    children,
}: ContentPageProps) {
    return (
        <main className="min-w-0 flex-1 bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto w-full max-w-5xl">
                <header className="max-w-3xl border-b border-border pb-6 sm:pb-8">
                    <p className="text-caption font-semibold text-muted-foreground">
                        {eyebrow}
                    </p>
                    <h1 className="mt-2 font-display text-heading-2 font-bold tracking-tight text-foreground sm:text-heading-1">
                        {title}
                    </h1>
                    <p className="mt-3 text-body-lg text-muted-foreground">
                        {description}
                    </p>
                    {updatedAt && (
                        <p className="mt-4 text-small text-muted-foreground">
                            Last updated: {updatedAt}
                        </p>
                    )}
                </header>
                <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
                    {children}
                </div>
            </div>
        </main>
    );
}

export function ContentSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-heading-4 font-semibold text-foreground sm:text-title">
                {title}
            </h2>
            <div className="mt-3 space-y-3 text-body-sm leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
                {children}
            </div>
        </section>
    );
}
