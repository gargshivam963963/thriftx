import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import AnalyticsProviderWrapper from "@/components/AnalyticsProviderWrapper";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
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
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.jpg`,
  description: siteConfig.description,
  sameAs: [
    "https://instagram.com/thriftx",
    "https://twitter.com/thriftx",
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
      className={`${jakarta.variable} ${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
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
            <CartProvider>
              <AnalyticsProviderWrapper>
                <div className="pointer-events-none fixed left-4 top-4 z-[60] hidden">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-xl backdrop-blur-md">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    CONNECTED
                  </div>
                </div>

                <Header />

                <main className="flex flex-1 flex-col">
                  {children}
                </main>

                <Footer />
                <BottomNav />

                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  duration={3000}
                />
              </AnalyticsProviderWrapper>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

