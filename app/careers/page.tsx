import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { ContentPage } from "@/components/content/ContentPage";
import { contactInfo } from "@/lib/contact";

export const metadata: Metadata = {
    title: "Careers",
    description:
        "Interested in working with THRIFTX? Contact our team in Panipat, Haryana.",
    alternates: { canonical: "/careers" },
};

export default function CareersPage() {
    return (
        <ContentPage
            eyebrow="Work with us"
            title="Careers at THRIFTX"
            description="We’re building a thoughtful shopping experience around individual pre-loved finds."
        >
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <BriefcaseBusiness className="h-6 w-6 text-foreground" aria-hidden="true" />
                <h2 className="mt-4 font-display text-heading-4 font-semibold text-foreground">
                    No public openings right now
                </h2>
                <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-muted-foreground">
                    We don’t have a live jobs board at this time. If you’re based in
                    or near Panipat and would like to introduce yourself, send a
                    short note and your experience to our team.
                </p>
                <a
                    href={`mailto:${contactInfo.email}?subject=Careers%20at%20THRIFTX`}
                    className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-foreground px-4 py-2 text-body-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Email our team
                </a>
            </section>
        </ContentPage>
    );
}
