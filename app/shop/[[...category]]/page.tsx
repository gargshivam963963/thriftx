import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { getProducts } from '@/lib/products';
import { getCategories, getSubCategories } from '@/lib/categories';

type Category = {
  id: string;
  slug: string;
  name: string;
};

type SubCategory = {
  id: string;
  slug: string;
  name: string;
};

export default async function Shop({ params }: { params: Promise<{ category?: string[] }> }) {
  const { category = [] } = await params;
  const mainCategory = category[0] ?? '';
  const subCategory = category[1] ?? '';
  const categoryTitle = category[category.length - 1] ?? 'All Items';

  const products = await getProducts(mainCategory, subCategory);
  const categories = await getCategories();

  const categoriesWithSubs = await Promise.all(
    categories.map(async (categoryItem: Category) => ({
      ...categoryItem,
      subCategories: (await getSubCategories(categoryItem.slug)) as SubCategory[],
    }))
  );

  return (
    <div className="flex-grow flex flex-col md:flex-row px-5 md:px-16 gap-8 py-8 max-w-[1600px] mx-auto w-full">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 hidden md:flex flex-col gap-8 shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-2xl font-semibold">Filters</h2>
          <button className="text-xs font-semibold tracking-widest uppercase text-[#4c4546] hover:text-black transition-colors">Clear All</button>
        </div>

        <div className="border-b border-[#e5e5e5] pb-6">
          <h3 className="font-sans text-lg font-semibold mb-4">Category</h3>

          <div className="flex flex-col gap-4">
            {categoriesWithSubs.map((category) => (
              <div key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className={`text-sm transition-colors ${mainCategory === category.slug
                    ? 'text-black font-semibold'
                    : 'text-[#4c4546] hover:text-black'
                    }`}
                >
                  {category.name}
                </Link>

                {category.subCategories.length > 0 && (
                  <div className="pl-4 mt-2 ml-2 border-l border-[#e5e5e5] flex flex-col gap-2">
                    {category.subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/shop/${category.slug}/${sub.slug}`}
                        className={`text-xs transition-colors ${mainCategory === category.slug && subCategory === sub.slug
                          ? 'text-black font-semibold'
                          : 'text-[#7e7576] hover:text-black'
                          }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-[#e5e5e5] pb-6">
          <h3 className="font-sans text-lg font-semibold mb-4">Brand</h3>
          <div className="flex flex-col gap-3">
            {['Supreme', 'Stüssy', 'BAPE', 'Carhartt WIP'].map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-[#7e7576] text-black focus:ring-black w-5 h-5 bg-transparent group-hover:border-black transition-colors"
                  defaultChecked={brand === 'Stüssy'}
                />
                <span className={`font-sans text-base transition-colors ${brand === 'Stüssy' ? 'text-black font-medium' : 'text-[#4c4546] group-hover:text-black'}`}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-b border-[#e5e5e5] pb-6">
          <h3 className="font-sans text-lg font-semibold mb-4">Size</h3>
          <div className="flex flex-wrap gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                className={`w-10 h-10 border rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${size === 'M' ? 'border-black bg-black text-white' : 'border-[#cfc4c5] text-black hover:border-black'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1 w-full">
        <div className="mb-6">
          <div className="text-[#7e7576] font-sans text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">
              Shop
            </Link>
            {category.map((cat, i) => (
              <span key={cat} className="flex items-center gap-2">
                <span>/</span>
                <span className={i === category.length - 1 ? 'text-black font-semibold' : 'hover:text-black'}>
                  {cat}
                </span>
              </span>
            ))}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black uppercase tracking-widest capitalize">
            {categoryTitle}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6 py-2 border-t border-[#e5e5e5] pt-4">
          <button className="md:hidden flex items-center gap-2 border border-black px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-black">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="hidden md:flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-[#eeeeee] px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase">
              Stüssy <button className="hover:text-black ml-1">×</button>
            </span>
            <span className="inline-flex items-center gap-1 bg-[#eeeeee] px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase">
              Size M <button className="hover:text-black ml-1">×</button>
            </span>
          </div>
          <span className="hidden md:block text-[10px] font-semibold tracking-widest uppercase text-[#7e7576]">
            {products.length} Items Found
          </span>

          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-[#4c4546] hidden sm:inline">Sort by:</span>
            <select className="bg-transparent border-none font-sans text-sm font-semibold focus:ring-0 cursor-pointer p-0 pr-6">
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>

        <div className="flex justify-center mt-16 mb-8">
          <button className="bg-transparent border-[1.5px] border-black text-black px-10 py-4 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition-all hover:tracking-[0.15em]">
            Load More Finds
          </button>
        </div>
      </div>
    </div>
  );
}
