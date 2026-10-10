import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import StorefrontChrome from "@/components/layout/StorefrontChrome";
import { AuthProvider } from "@/lib/AuthContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { CartProvider } from "@/lib/CartContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import AnalyticsProviderWrapper from "@/components/AnalyticsProviderWrapper";
import { MotionProvider } from "@/components/animations/Motion";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/seo";
import { contactInfo } from "@/lib/contact";

// ─── Design System: ONE premium font family ─────────────────────────────────
// Geist is the single typeface for the entire THRIFTX design system —
// a crisp, modern variable sans built for the web. It powers both display
// (headings) and body text via distinct weights (400–800).
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.title,
    template: "%s | THRIFTX",
  },

  description: siteConfig.description,

  keywords: siteConfig.keywords,

  applicationName: siteConfig.name,

  creator: siteConfig.creator,

  publisher: siteConfig.publisher,

  category: siteConfig.category,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
  },

  icons: {
    icon: [{ url: "/icon.jpg", sizes: "any" }],
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },

  appleWebApp: {
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.jpg`,
  description: siteConfig.description,
  email: contactInfo.email,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+91${contactInfo.phone}`,
    email: contactInfo.email,
    contactType: "customer support",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    contactInfo.instagramUrl,
    contactInfo.facebookUrl,
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/shop?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={geist.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem("thriftx_theme");var t=p==="dark"||p==="light"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t)}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className="min-h-screen overflow-x-hidden antialiased flex flex-col"
        style={{ fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif" }}
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#000000"
          height={3}
          showSpinner={false}
          crawl
          crawlSpeed={200}
          speed={300}
          easing="ease"
          shadow={false}
          initialPosition={0.08}
        />

        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <MotionProvider>
                  <AnalyticsProviderWrapper>
                    <StorefrontChrome>{children}</StorefrontChrome>

                    <Toaster
                      position="bottom-center"
                      richColors
                      closeButton
                      duration={3000}
                      gap={10}
                      visibleToasts={4}
                      toastOptions={{
                        className: "thriftx-toast",
                        style: {
                          borderRadius: "16px",
                          backdropFilter: "blur(20px) saturate(1.4)",
                        },
                      }}
                    />
                  </AnalyticsProviderWrapper>
                </MotionProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
