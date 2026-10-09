"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/animations/PageTransition";

/**
 * Storefront chrome (header, footer, mobile tab bar) + the marketing page
 * transition.
 *
 * WHY THIS EXISTS
 * ---------------
 * The admin panel used to be rendered *inside* the storefront root layout, so
 * every admin route still mounted `<Header>`, `<Footer>` and `<BottomNav>` and
 * then threw the result away with `return null`. That meant each admin
 * navigation paid for three extra component trees — plus Header's auth / cart /
 * wishlist subscriptions — on top of the full remount caused by
 * `PageTransition`'s `key={pathname}`. The combined effect felt like a hard
 * page reload.
 *
 * Splitting the chrome into its own client component lets a single early
 * `pathname` check decide between two completely different trees. Admin pages
 * now render *only* the admin shell, so navigating between them preserves the
 * sidebar and swaps just the page chunk — the app-shell behaviour Next.js is
 * supposed to give you for free.
 *
 * Keep this list in sync with the `startsWith("/admin")` guards that remain as
 * a defence in depth inside Header.tsx, Footer.tsx and BottomNav.tsx.
 */
export default function StorefrontChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />

      <main className="flex flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
