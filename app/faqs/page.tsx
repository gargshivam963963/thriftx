import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content/ContentPage";
import { contactInfo } from "@/lib/contact";

export const metadata: Metadata = {
    title: "FAQs",
    description:
        "Answers about shopping pre-loved clothing at THRIFTX, order payments, delivery, cancellations, and returns.",
    alternates: { canonical: "/faqs" },
};

const faqs = [
    {
        question: "Are THRIFTX items new?",
        answer:
            "THRIFTX focuses on pre-loved clothing. Items are individually listed with the product details available on that listing. Please review the photos, size, and condition notes before ordering.",
    },
    {
        question: "Why is an item no longer available?",
        answer:
            "Many pieces are unique or available in very limited quantities. Once a piece has been ordered and inventory is updated, it may no longer appear as available.",
    },
    {
        question: "How much does delivery cost and how long will it take?",
        answer:
            "Available delivery methods, estimates, and charges depend on your address and are shown at checkout before you pay. Panipat local delivery may be available for eligible addresses; the checkout page confirms the option for your address.",
    },
    {
        question: "What payment methods can I use?",
        answer:
            "Checkout shows the payment methods available for your order, including online payment or cash on delivery when eligible. Your final total and selected method are shown before you place the order.",
    },
    {
        question: "Can I cancel an order?",
        answer:
            "Eligible orders can be cancelled while their status is Pending, Pending (COD), or Processing. If the order has moved beyond those statuses, contact support for help.",
    },
    {
        question: "How do I request a return?",
        answer:
            "A signed-in customer can request a return from the order page within 7 days of delivery. The order must be marked Delivered and only one request can be submitted for an order. Our team reviews the request; see the Returns page for details.",
    },
    {
        question: "Where can I find my order or tracking information?",
        answer:
            "Open My Orders after signing in. Tracking information appears when it is available for the shipment. You can also contact support with your order number.",
    },
    {
        question: "How can I reach THRIFTX?",
        answer: (
            <>
                Email{" "}
                <a
                    href={`mailto:${contactInfo.email}`}
                    className="font-medium text-foreground underline underline-offset-4"
                >
                    {contactInfo.email}
                </a>{" "}
                or message us on{" "}
                <a
                    href={contactInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline underline-offset-4"
                >
                    WhatsApp at {contactInfo.phone}
                </a>
                . Support hours are Monday–Saturday, 10:00 AM–7:00 PM IST.
            </>
        ),
    },
];

export default function FaqsPage() {
    return (
        <ContentPage
            eyebrow="Help center"
            title="Frequently asked questions"
            description="Quick answers to common questions about unique finds, orders, delivery, and returns."
        >
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {faqs.map((faq) => (
                    <details key={faq.question} className="group px-5 py-4 sm:px-6">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-body-sm font-semibold text-foreground marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                            {faq.question}
                            <span
                                className="text-xl font-normal text-muted-foreground transition-transform group-open:rotate-45"
                                aria-hidden="true"
                            >
                                +
                            </span>
                        </summary>
                        <p className="max-w-3xl pb-2 pr-8 pt-2 text-body-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                        </p>
                    </details>
                ))}
            </div>
            <p className="text-body-sm text-muted-foreground">
                Still need help? <Link href="/contact" className="font-semibold text-foreground underline underline-offset-4">Contact our team</Link>.
            </p>
        </ContentPage>
    );
}
