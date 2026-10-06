import type { Metadata } from "next";

import { PANIPAT_DELIVERY_PROMO } from "@/lib/shipping/constants";

/**
 * Checkout route metadata.
 *
 * Checkout is a private, transactional surface: it is `noindex, nofollow` in
 * `app/robots.ts` and this metadata mirrors that intent so a crawler that
 * reaches the URL directly is also told not to index it.
 *
 * The description still carries the Panipat promise because it is the string
 * used when the checkout URL is shared or pasted into a chat/WhatsApp.
 */
export const metadata: Metadata = {
    title: "Secure Checkout",
    description: `Complete your THRIFTX order. ${PANIPAT_DELIVERY_PROMO.seoFragment}`,
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            nocache: true,
        },
    },
};

export default function CheckoutLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return children;
}