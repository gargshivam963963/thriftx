import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage, ContentSection } from "@/components/content/ContentPage";

export const metadata: Metadata = {
    title: "Returns, Cancellations & Refunds",
    description:
        "Understand THRIFTX order cancellation eligibility, the 7-day return request window, and how to contact support.",
    alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
    return (
        <ContentPage
            eyebrow="Customer care"
            title="Returns, cancellations & refunds"
            description="We want you to know what to expect if an order needs to be changed or returned."
            updatedAt="4 October 2026"
        >
            <ContentSection title="Requesting a return">
                <ul>
                    <li>
                        A return request can be submitted within 7 days of delivery.
                    </li>
                    <li>
                        The order must show as Delivered, and a return request must
                        not already exist for that order.
                    </li>
                    <li>
                        Sign in, open the order, and submit the request with a reason.
                        Our team will review it and update the return status.
                    </li>
                </ul>
                <p>
                    Submitting a request does not itself mean that the return or a
                    refund has been approved. Follow the status and instructions in
                    your order, or <Link href="/contact">contact support</Link>.
                </p>
                <p>
                    If an item arrives damaged, incorrect, or materially different
                    from its listing, contact us promptly with your order number and
                    clear photos so the team can review the issue.
                </p>
            </ContentSection>
            <ContentSection title="Cancelling an order">
                <p>
                    Customer cancellation is available for orders in Pending, Pending
                    (COD), or Processing status. Once an order has moved to another
                    status, contact support and we’ll advise whether any action is
                    still possible.
                </p>
            </ContentSection>
            <ContentSection title="Refunds">
                <p>
                    Refund handling depends on the order, payment method, and review
                    outcome. The order page will show the recorded refund status.
                    Support will confirm the next steps for an approved refund;
                    please do not treat a return request or status update alone as
                    confirmation that funds have been issued.
                </p>
            </ContentSection>
            <ContentSection title="Need help?">
                <p>
                    Contact <Link href="/contact">THRIFTX support</Link> with your
                    order number, a short description, and relevant photos.
                </p>
            </ContentSection>
        </ContentPage>
    );
}
