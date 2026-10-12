import type { Metadata } from "next";

/** Signup is a private utility surface — never index it. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
