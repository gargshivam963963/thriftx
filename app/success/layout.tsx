import type { Metadata } from "next";

/**
 * Post-payment confirmation page. `robots.ts` already disallows crawling it,
 * and this noindex directive additionally tells search engines that do reach
 * the URL (e.g. via a shared link) not to index it.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
