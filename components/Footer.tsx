import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#ffffff] border-t border-[#e5e5e5] mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-5 md:px-16 py-8 sm:py-10 md:py-12 w-full max-w-7xl mx-auto gap-6 sm:gap-8">
        <span className="font-serif text-2xl sm:text-3xl md:text-2xl font-bold tracking-widest text-black uppercase">THRIFTX</span>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Sustainability', 'Shipping', 'Returns', 'Contact', 'Terms'].map((item) => (
            <Link key={item} href="#" className="text-[#4c4546] hover:text-black transition-all duration-300 text-xs font-semibold tracking-widest uppercase hover:tracking-[0.15em]">
              {item}
            </Link>
          ))}
        </nav>
        <p className="text-[#4c4546] text-xs opacity-80 text-center md:text-right font-sans">
          © 2024 THRIFTX PANIPAT. SUSTAINABLE LUXURY.
        </p>
      </div>
    </footer>
  );
}
