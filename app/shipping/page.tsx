import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content/ContentPage";

export const metadata: Metadata = {
    title: "Shipping & Delivery",
    description:
        "Learn how THRIFTX delivery options, estimates, address eligibility, and shipping charges are shown at checkout.",
    alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
    return (
        <ContentPage
            eyebrow="Orders and delivery"
            title="Shipping & delivery"
            description="Delivery options and charges are confirmed for your address at checkout, before you place an order."
            updatedAt="4 October 2026"
        >
            <ContentSection title="Delivery options">
                <ul>
                    <li>
                        Eligible addresses in Panipat may be offered free same-day
                        delivery, typically within 2–3 hours. Orders placed before
                        2:00 PM are intended for same-day dispatch; availability and
                        the estimate shown at checkout take precedence.
                    </li>
                    <li>
                        Other addresses are served by courier options available for
                        the destination. The estimated delivery time depends on the
                        selected courier service.
                    </li>
                </ul>
                <p>
                    Estimates are not guarantees and can change due to courier
                    capacity, serviceability, weather, or other delivery conditions.
                    The option selected and estimate shown at checkout are the
                    relevant details for your order.
                </p>
            </ContentSection>
            <ContentSection title="Shipping charges">
                <p>
                    Charges depend on the delivery address, the available courier
                    rates, and the shipping method. Standard shipping may be free on
                    eligible orders of ₹1,199 or more; express shipping may still
                    carry a charge. The exact shipping amount is shown in your
                    checkout total before payment.
                </p>
            </ContentSection>
            <ContentSection title="Tracking and delivery issues">
                <p>
                    When courier tracking becomes available, you can find it under{" "}
                    <Link href="/profile/orders">My Orders</Link>. If tracking is
                    missing, your address needs correction, or a delivery is delayed,
                    <Link href="/contact"> contact support</Link> with your order
                    number.
                </p>
            </ContentSection>
        </ContentPage>
    );
}
