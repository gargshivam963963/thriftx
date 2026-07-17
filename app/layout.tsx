import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';
import TopLoader from "@/components/ui/TopLoader";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'THRIFTX - Premium Thrift E-commerce',
  description: 'Curated Vintage. Sustainable Luxury.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#f9f9f9] text-[#1b1b1b] font-sans antialiased min-h-screen flex flex-col pt-16 sm:pt-20 pb-20 md:pb-0 overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <div className="fixed top-4 left-4 z-[60] pointer-events-none hidden">
              <div className="bg-black text-white px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase shadow-xl flex items-center gap-2 backdrop-blur-md border border-white/10">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                CONNECTED
              </div>
            </div>
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

