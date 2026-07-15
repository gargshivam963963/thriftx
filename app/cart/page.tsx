import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Minus, Plus, Trash2, Lock, ShieldCheck } from 'lucide-react';

export default function Cart() {
  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Left Column */}
      <div className="lg:col-span-8 flex flex-col gap-12">
        <nav className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#4c4546]">
          <Link href="/cart" className="text-black font-bold">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Shipping</span>
          <ChevronRight className="w-4 h-4" />
          <span>Payment</span>
        </nav>
        
        <h1 className="font-serif text-3xl font-bold text-black">Your Cart</h1>

        <div className="flex flex-col gap-6">
          {/* Cart Item 1 */}
          <div className="bg-white/70 backdrop-blur-xl border border-[#e5e5e5] p-6 rounded-[24px] flex flex-col sm:flex-row gap-6 items-start sm:items-center relative hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300">
            <Link href="/product" className="w-full sm:w-32 aspect-[1/1.25] bg-[#eeeeee] rounded-xl overflow-hidden shrink-0 block">
              <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXECW5NW0UXA8eSR2jPIQclaVvx8wy4npqHz-yIy2-w9G-J1nPtpNNzrTIw6NOjvu1D99aVLK_sF6CZrhTE0_x0e9QOiQhPoVbEldOD31iRUpzfWl6viIz58Y6kD5oK6H-gGwr1IfCa4wvI94mk-pxevKrHEotceEavRJEA6H7VWHYl6B-fq9H6sX-dKQueT8sdBsGxB8Haq_CTmh4-04Eq4RIutFnIrKnfRiFzcdAHh-y8XvFcF3h" alt="Jacket" width={128} height={160} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </Link>
            <div className="flex-grow flex flex-col gap-2 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <Link href="/product" className="font-sans text-lg font-semibold text-black hover:underline">Vintage Leather Moto Jacket</Link>
                  <p className="font-sans text-sm text-[#4c4546] mt-1">Size: L | Color: Black</p>
                </div>
                <span className="font-sans text-xl font-bold text-black">$185</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-[#cfc4c5] rounded-full px-4 py-1.5">
                  <button className="text-[#4c4546] hover:text-black"><Minus className="w-4 h-4" /></button>
                  <span className="font-sans text-sm mx-5 font-semibold">1</span>
                  <button className="text-[#4c4546] hover:text-black"><Plus className="w-4 h-4" /></button>
                </div>
                <button className="text-xs font-semibold tracking-widest uppercase text-[#4c4546] hover:text-black underline underline-offset-4 ml-auto">Move to Wishlist</button>
                <button className="text-[#4c4546] hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* Cart Item 2 */}
          <div className="bg-white/70 backdrop-blur-xl border border-[#e5e5e5] p-6 rounded-[24px] flex flex-col sm:flex-row gap-6 items-start sm:items-center relative hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300">
            <Link href="/product" className="w-full sm:w-32 aspect-[1/1.25] bg-[#eeeeee] rounded-xl overflow-hidden shrink-0 block">
              <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuD93YckK9K--z87yP7LwgpNRG6KRovi64p60QXTDnDjy0tjXYRIR2xwz2eTFZTIX6tIThrPQ3l6GuHRiE4vm30jBQUbNF6MvR8v8GA541wRi5EDniQEIUsW7JV8uQoeEdKB2SsWdYaQDuifdWYk0ppXcBnz3DJYt9NrcyXdr6DbSc9Dny2AXpYSMaZoScWthYZ65UtP7FxL1YMqMWgO4xWANGQiZPixEinpyN8J-OH7deUcTI90d4_t" alt="Denim" width={128} height={160} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </Link>
            <div className="flex-grow flex flex-col gap-2 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <Link href="/product" className="font-sans text-lg font-semibold text-black hover:underline">Acne Studios 1996 Denim</Link>
                  <p className="font-sans text-sm text-[#4c4546] mt-1">Size: 32 | Color: Vintage Blue</p>
                </div>
                <span className="font-sans text-xl font-bold text-black">$120</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-[#cfc4c5] rounded-full px-4 py-1.5">
                  <button className="text-[#4c4546] hover:text-black"><Minus className="w-4 h-4" /></button>
                  <span className="font-sans text-sm mx-5 font-semibold">1</span>
                  <button className="text-[#4c4546] hover:text-black"><Plus className="w-4 h-4" /></button>
                </div>
                <button className="text-xs font-semibold tracking-widest uppercase text-[#4c4546] hover:text-black underline underline-offset-4 ml-auto">Move to Wishlist</button>
                <button className="text-[#4c4546] hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-semibold text-black mb-6">Shipping Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Email</label>
              <input type="email" placeholder="Email address" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">First Name</label>
              <input type="text" placeholder="First Name" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Last Name</label>
              <input type="text" placeholder="Last Name" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Address</label>
              <input type="text" placeholder="Street Address" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">City</label>
              <input type="text" placeholder="City" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">ZIP / Postal Code</label>
              <input type="text" placeholder="ZIP Code" className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Summary */}
      <div className="lg:col-span-4 mt-8 lg:mt-0">
        <div className="bg-white/70 backdrop-blur-xl border border-[#e5e5e5] p-8 rounded-[32px] sticky top-28 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
          <h2 className="font-serif text-2xl font-semibold text-black mb-6 border-b border-[#e5e5e5] pb-6">Order Summary</h2>
          <div className="flex flex-col gap-4 font-sans text-base text-[#4c4546] mb-8">
            <div className="flex justify-between">
              <span>Subtotal (2 items)</span>
              <span className="text-black font-semibold">$305.00</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-black font-semibold">$15.00</span>
            </div>
            <div className="flex justify-between text-[#a17f3b]">
              <span>Discount</span>
              <span>-$0.00</span>
            </div>
          </div>
          <div className="border-t border-[#e5e5e5] pt-6 mb-8 flex justify-between items-end">
            <span className="font-sans text-xl font-bold text-black">Total</span>
            <span className="font-sans text-2xl font-bold text-black">$320.00</span>
          </div>
          <div className="flex gap-3 mb-8">
            <input type="text" placeholder="Promo code" className="flex-grow w-full min-w-0 bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-3.5 font-sans text-base focus:border-black outline-none transition-colors" />
            <button className="bg-[#eeeeee] border border-[#cfc4c5] text-black text-xs font-semibold tracking-widest uppercase px-6 py-3.5 rounded-xl hover:bg-[#e2e2e2] transition-colors shrink-0">Apply</button>
          </div>
          <button className="w-full bg-black text-white font-sans text-lg font-medium py-5 rounded-2xl hover:bg-black/90 transition-opacity flex justify-center items-center gap-3">
            Proceed to Payment <Lock className="w-5 h-5" />
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#7e7576] mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Checkout
          </p>
        </div>
      </div>
    </div>
  );
}
