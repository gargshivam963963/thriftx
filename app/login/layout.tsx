import type { Metadata } from "next";

/**
 * Auth route — keep the login page out of the search index. Without this the
 * page inherited the root layout's `index: true`, making a credential page
 * indexable.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
