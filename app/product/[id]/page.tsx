import Image from 'next/image';
import { BadgeCheck, ChevronDown } from 'lucide-react';
import { getProductById, Product } from '@/lib/products';
import ProductTryOnButton from '@/components/ProductTryOnButton';
import ProductActions from './ProductActions';

function getRetailPrice(price?: number): string {
  if (price == null) return '';

  return `₹${Math.round(price * 1.25).toLocaleString('en-IN')}`;
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: Product | null = await getProductById(id);

  if (!product) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-8 md:pt-16 pb-24">
        <div className="text-center py-24">Product not found.</div>
      </div>
    );
  }

  const retailPrice = product.retailPrice || getRetailPrice(product.price);
  const descriptionText = product.description || `${product.title} from ${product.brand || 'our curated collection'} is presented in ${product.condition ? product.condition.toLowerCase() : 'excellent'} condition and ready to be styled with confidence.`;
  const measurements = product.measurements || {};
  const measurementRows = [
    { label: 'Size', value: measurements.size || (product.category ? product.category : 'Available on request') },
    { label: 'Chest', value: measurements.chest || 'Available on request' },
    { label: 'Length', value: measurements.length || 'Available on request' },
    { label: 'Shoulders', value: measurements.shoulders || 'Available on request' },
  ];
  const shippingText = product.shippingInfo || `${product.brand || 'This piece'} is shipped with authenticity confirmation and a care note tailored to its condition.`;

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-16 pt-8 md:pt-16 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            {product.onlyOneLeft && <span className="bg-[#064E3B] text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase shadow-sm">Only 1 Left</span>}
            <span className="bg-white/80 backdrop-blur-md text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest flex items-center gap-1.5 border border-[#C5A059]/30 shadow-sm">
              <BadgeCheck className="w-4 h-4" /> Verified Authentic
            </span>
          </div>

          <div className="relative w-full aspect-[4/5] md:aspect-square bg-[#eeeeee] rounded-[32px] overflow-hidden group border border-[#e5e5e5]">
            <Image src={product.image || '/assets/placeholder.png'} alt={product.title} fill className="object-cover" referrerPolicy="no-referrer" />
            <ProductTryOnButton productImage={product.image || '/assets/placeholder.png'} productName={product.title} />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            <div className="relative min-w-[80px] h-[96px] overflow-hidden rounded-xl border-2 border-black">
              <Image src={product.image || '/assets/placeholder.png'} alt={`${product.title} preview`} width={80} height={96} className="object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-10 md:sticky md:top-32 h-fit">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4c4546]">{product.brand}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-black leading-tight">{product.title}</h1>
            <div className="flex items-end gap-4 mt-4">
              <span className="font-sans text-3xl font-bold text-black">{product.price}</span>
              {retailPrice ? <span className="font-sans text-base text-[#7e7576] line-through mb-1">{retailPrice} Retail</span> : null}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-[#f3f3f3] px-4 py-2 rounded-lg flex items-center gap-2 border border-[#e5e5e5]">
                <span className="text-xs font-semibold tracking-widest uppercase text-black">Condition: {product.condition}</span>
              </div>
              <span className="font-sans text-sm text-[#4c4546]">{descriptionText}</span>
            </div>
          </div>

          <ProductActions product={product} />

          <div className="flex flex-col border-t border-[#e5e5e5] pt-4 mt-4">
            <div className="py-5 border-b border-[#e5e5e5] flex justify-between items-center cursor-pointer">
              <span className="text-xs font-semibold tracking-widest uppercase text-black">Description</span>
              <ChevronDown className="w-5 h-5 text-[#4c4546]" />
            </div>
            <div className="py-5 border-b border-[#e5e5e5]">
              <div className="flex justify-between items-center cursor-pointer mb-6">
                <span className="text-xs font-semibold tracking-widest uppercase text-black">Measurements</span>
                <ChevronDown className="w-5 h-5 text-black rotate-180" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {measurementRows.map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-[#e5e5e5] pb-3">
                    <span className="font-sans text-[#4c4546]">{row.label}</span>
                    <span className="font-sans text-black font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="py-5 border-b border-[#e5e5e5] flex justify-between items-center cursor-pointer">
              <span className="text-xs font-semibold tracking-widest uppercase text-black">Shipping & Authenticity</span>
              <ChevronDown className="w-5 h-5 text-[#4c4546]" />
            </div>
            <div className="pt-4 text-sm text-[#4c4546] leading-6">{shippingText}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
