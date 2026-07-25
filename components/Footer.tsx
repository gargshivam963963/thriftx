'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="w-full border-t border-zinc-200 bg-white mt-auto dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10 md:flex-row md:justify-between md:px-16 md:py-12">
        <span className="font-serif text-2xl font-bold tracking-widest text-black uppercase sm:text-3xl md:text-2xl dark:text-white">
          THRIFTX
        </span>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Sustainability', 'Shipping', 'Returns', 'Contact', 'Terms'].map((item) => (
            <Link key={item} href="#" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 transition-all duration-300 hover:text-black hover:tracking-[0.15em] dark:text-zinc-400 dark:hover:text-white">
              {item}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-zinc-400 md:text-right font-sans dark:text-zinc-500">
          © 2024 THRIFTX. SUSTAINABLE LUXURY.
        </p>
      </div>
    </footer>
  );
}

