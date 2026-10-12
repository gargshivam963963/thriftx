import type { Metadata } from "next";

/** Password reset tokens flow through this route — keep it out of the index. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
