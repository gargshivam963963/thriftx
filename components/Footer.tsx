'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="w-full border-t border-border bg-background mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10 md:flex-row md:justify-between md:px-16 md:py-12">
        <span className="text-h4 font-serif font-bold tracking-widest text-foreground uppercase">
          THRIFTX
        </span>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Sustainability', 'Shipping', 'Returns', 'Contact', 'Terms'].map((item) => (
            <Link key={item} href="#" className="text-small font-semibold uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:text-foreground hover:tracking-[0.15em]">
              {item}
            </Link>
          ))}
        </nav>
        <p className="text-small text-center text-muted-foreground md:text-right">
          © 2024 THRIFTX. SUSTAINABLE LUXURY.
        </p>
      </div>
    </footer>
  );
}

