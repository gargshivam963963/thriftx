import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[75vh] md:h-[800px] overflow-hidden bg-[#dadada]">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAhMBRDJd7I5_jpheLvsRUQEUgc_ROQgnLRfte150BaaDxzxkNfiDpGF1LAn5GWSPzr_JuOFkZwR9OvD6nkG-k888drZWevW8pfFIKTRNt-OmiK78XAkdf9hzFjmffoqZqNp42CDk_Q57XdxYHn31L3nwMp2W20axXUKQ7v-JBuU-2gB0kQW9nULdD7E895Bbh-qVVQxbkBl7mp__EEYI_KF-4MTaRnA7iFaa_Y4TG0TrX-obT_t0-"
          alt="Editorial model wearing vintage leather jacket"
          fill
          className="object-cover transition-transform duration-[20s] hover:scale-105"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-16 pb-20">
          <div className="max-w-2xl text-white">
            <span className="inline-block px-4 py-1.5 mb-6 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-widest uppercase border border-white/30 text-white">
              The Archive Collection
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-lg leading-tight">
              Curated Vintage.<br />Sustainable Luxury.
            </h1>
            <Link href="/shop" className="px-8 py-4 bg-white text-black rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-[#eeeeee] transition-colors shadow-lg inline-block">
              Shop New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-5 md:px-16 max-w-[1600px] mx-auto">
        <h2 className="font-serif text-3xl font-semibold text-black mb-8">Explore Eras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          <Link href="/shop" className="group relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden bg-[#f3f3f3] h-[400px] md:h-full">
            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYhxkMes_R4dEWHb8mqY0ksJigXy1YBVgOwkCK3d-vFWqU3HIH8u2fEQy1_VjtKWua6kIGtmtO1vsW8CkvJJkh8O993V-PJ-P3g8L3trRoYPLmqEBFsmNWOHmrbChlAzywuJOarwhLlZT8QgamIwnEW9R44fy6RhST-HZsSilmCE5wqrlyA29JNBsbbITPlFvV_YWiO3JAXmMEnGhhV6zLnIydNQJ2i1COLBeFznjivAdOGJFtlQid" alt="Heritage Denim" fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="font-serif text-2xl font-semibold text-white mb-2">Heritage Denim</h3>
              <p className="font-sans text-white/80">Curated Levi&apos;s, Evisu & Archive Pieces</p>
            </div>
          </Link>
          <Link href="/shop" className="group relative rounded-3xl overflow-hidden bg-[#f3f3f3] h-[300px] md:h-full">
            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg8hGU_ivnMQ_xbMMAP5ryAPCO5Mbia_DAk-ClzY-HPrUGUfw5f-SxDFqAN4uGmN4RHG5Eag00iIcKhRlMgg7ZUODtoyWoXkx8GH-MnSQMeaz8l6-sCPvOZrQiM8hd5AQRzl_4tdWTK3WkpXrV6X4V0WELYcG2BIXhmXQI-tNAyRDwfChw_uCK213xnOah57P0JFGGYuM5ycEKK77fC60xaEp_oYyxCtMbFp_6OyN9reJIzq7G2ZM8" alt="Hardware & Goods" fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="font-serif text-2xl font-semibold text-white">Hardware & Goods</h3>
            </div>
          </Link>
          <Link href="/shop" className="group relative rounded-3xl overflow-hidden bg-[#f3f3f3] h-[300px] md:h-full">
            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyNhW_fNDHV-tYpseA1S7OePYFbvpBbhFAY5tYOFwHhyG5hOFZPoYgNOC5p6PEzJqRUBcnMFqNYmFI31X5231HdjapeiTeTkGmIC6RqLwvt9c1s_u9rMSQAfmUsFkwAgUtzRtgAV8L10KWe5ehRCM5mQKdGC-_8DZsqyuymBvpwd1Fj--QAoD54LnRDJUyY-V86zNji4r5NW4PWg26bu7lJhx4osZpKF5BQ9SFCuRyTsE_DFbYa7m2" alt="Graphic Archive" fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="font-serif text-2xl font-semibold text-white">Graphic Archive</h3>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
