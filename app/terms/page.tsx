import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage, ContentSection } from "@/components/content/ContentPage";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Read the terms for using THRIFTX, placing orders, product availability, payments, delivery, and customer support.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <ContentPage
            eyebrow="Legal"
            title="Terms of service"
            description="These terms describe the basic rules for using the THRIFTX website and placing an order."
            updatedAt="4 October 2026"
        >
            <ContentSection title="Using the website">
                <p>
                    Use the site lawfully and provide accurate information when
                    creating an account or placing an order. You are responsible for
                    keeping your sign-in credentials private and for activity on your
                    account.
                </p>
            </ContentSection>
            <ContentSection title="Products and availability">
                <p>
                    THRIFTX lists pre-loved clothing. Product descriptions, photos,
                    size, and condition notes are provided to help you make a choice.
                    Many items are unique or limited; availability can change until
                    an order is confirmed. Inventory may be temporarily reserved
                    during checkout. Display colors can vary by screen.
                </p>
            </ContentSection>
            <ContentSection title="Orders and payment">
                <p>
                    Prices, available payment methods, delivery choices, and charges
                    are shown during checkout. An order is subject to successful
                    completion and confirmation. If an item becomes unavailable or an
                    order cannot be accepted, we will contact you and address any
                    payment already collected in line with the applicable refund
                    process.
                </p>
            </ContentSection>
            <ContentSection title="Delivery, cancellations, and returns">
                <p>
                    Delivery estimates are not guaranteed. Cancellation and return
                    requests follow the rules in our{" "}
                    <Link href="/shipping">Shipping policy</Link> and{" "}
                    <Link href="/returns">Returns policy</Link>, which form part of
                    these terms.
                </p>
            </ContentSection>
            <ContentSection title="Site content and availability">
                <p>
                    We work to keep product information and the service available,
                    but listings may change and uninterrupted access cannot be
                    guaranteed. Site content may not be copied or reused in a way
                    that violates applicable rights or laws.
                </p>
            </ContentSection>
            <ContentSection title="Contact and updates">
                <p>
                    We may revise these terms as the service changes. Continued use
                    after an update means the updated terms apply to future use. For
                    questions, please <Link href="/contact">contact THRIFTX</Link>.
                </p>
            </ContentSection>
        </ContentPage>
    );
}
