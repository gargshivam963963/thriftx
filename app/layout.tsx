import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "THRIFTX - Premium Thrift E-commerce",
  description: "Curated Vintage. Sustainable Luxury.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body
        className="min-h-screen overflow-x-hidden bg-[#f9f9f9] pt-16 pb-20 font-sans text-[#1b1b1b] antialiased sm:pt-20 md:pb-0 flex flex-col"
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

        <AuthProvider>
          <CartProvider>
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
              theme="light"
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}