import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContentPage, ContentSection } from "@/components/content/ContentPage";
import { Button } from "@/components/ui/button";
import { contactInfo } from "@/lib/contact";

export const metadata: Metadata = {
    title: "Contact THRIFTX",
    description:
        "Get help with a THRIFTX product, order, delivery, or return. Contact our Panipat support team.",
    alternates: { canonical: "/contact" },
};

export default function ContactPage() {
    return (
        <ContentPage
            eyebrow="We’re here to help"
            title="Contact THRIFTX"
            description="Questions about a piece or an order? Send us a message and include your order number when relevant."
        >
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                    href={`mailto:${contactInfo.email}`}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50 sm:p-6"
                >
                    <Mail className="h-5 w-5 text-foreground" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-title font-semibold text-foreground">
                        Email support
                    </h2>
                    <p className="mt-1 break-all text-body-sm text-muted-foreground">
                        {contactInfo.email}
                    </p>
                </a>
                <a
                    href={contactInfo.phoneHref}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50 sm:p-6"
                >
                    <Phone className="h-5 w-5 text-foreground" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-title font-semibold text-foreground">
                        Call us
                    </h2>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                        {contactInfo.phone}
                    </p>
                </a>
                <a
                    href={contactInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50 sm:p-6"
                >
                    <MessageCircle className="h-5 w-5 text-foreground" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-title font-semibold text-foreground">
                        WhatsApp
                    </h2>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                        Message us at {contactInfo.phone}
                    </p>
                </a>
            </section>
            <ContentSection title="Support hours and location">
                <p className="flex items-start gap-2">
                    <Clock3 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Monday–Saturday, 10:00 AM–7:00 PM IST. We’ll respond as soon as
                    possible during support hours.
                </p>
                <p className="flex items-start gap-2">
                    <MapPin size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Panipat, Haryana, India.
                </p>
            </ContentSection>
            <ContentSection title="Need order help?">
                <p>
                    Sign in to see your order status and tracking details. For a return
                    request, use the order page within 7 days of delivery. Our team
                    reviews each request.
                </p>
                <Button asChild variant="outline">
                    <Link href="/profile/orders">Go to my orders</Link>
                </Button>
            </ContentSection>
        </ContentPage>
    );
}
