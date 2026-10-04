import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage, ContentSection } from "@/components/content/ContentPage";
import { contactInfo } from "@/lib/contact";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Read how THRIFTX uses account, order, delivery, and site information to operate the shopping experience and support customers.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <ContentPage
            eyebrow="Legal"
            title="Privacy policy"
            description="This policy explains the information used when you browse, create an account, or place an order with THRIFTX."
            updatedAt="4 October 2026"
        >
            <ContentSection title="Information we use">
                <ul>
                    <li>
                        Account and contact details you provide, such as your name,
                        email address, and phone number.
                    </li>
                    <li>
                        Order and delivery information, including products ordered,
                        payment method, delivery address, and order status.
                    </li>
                    <li>
                        Site interaction and device information needed to operate,
                        secure, troubleshoot, and improve the service.
                    </li>
                </ul>
            </ContentSection>
            <ContentSection title="How we use information">
                <p>
                    We use information to create and secure accounts, process orders,
                    calculate delivery options, provide customer support, maintain
                    order and inventory records, and understand how the site is used.
                    We do not display private order information publicly.
                </p>
            </ContentSection>
            <ContentSection title="Service providers and sharing">
                <p>
                    We share only relevant information with providers needed to
                    operate the service, such as payment processing, authentication,
                    hosting, analytics, and courier or delivery services. Those
                    providers handle information under their own terms and privacy
                    practices. We do not sell personal information as a business
                    practice.
                </p>
            </ContentSection>
            <ContentSection title="Retention and security">
                <p>
                    We retain account and transaction records for as long as needed
                    to operate the service, meet applicable obligations, resolve
                    disputes, and maintain business records. We use reasonable
                    safeguards, but no internet service can guarantee absolute
                    security.
                </p>
            </ContentSection>
            <ContentSection title="Your choices and requests">
                <p>
                    You may contact us to request access, correction, or deletion of
                    account information, subject to records we may need to retain for
                    orders or legal obligations. You can also contact us with
                    questions about this policy.
                </p>
                <p>
                    Email{" "}
                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>{" "}
                    or use our <Link href="/contact">contact page</Link>.
                </p>
            </ContentSection>
            <ContentSection title="Changes to this policy">
                <p>
                    We may update this policy when our service or practices change.
                    The latest revision date will be shown at the top of this page.
                </p>
            </ContentSection>
        </ContentPage>
    );
}
