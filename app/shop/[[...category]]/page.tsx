import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { getProducts, getBrands } from '@/lib/products';
import { getCategories, getSubCategories } from '@/lib/categories';
import SortDropdown from "@/components/shop/SortDropdown";
import BrandFilter from "@/components/shop/BrandFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import PriceFilter from "@/components/shop/PriceFilter";

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

type ShopPageProps = {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    size?: string;
    price?: string;
  }>;
};

export default async function Shop({
  params,
  searchParams,
}: ShopPageProps) {
  const { category = [] } = await params;
  const {
    sort = "newest",
    brand,
    size,
    price,
  } = await searchParams;
  const mainCategory = category[0] ?? '';
  const subCategory = category[1] ?? '';
  const categoryTitle = category[category.length - 1] ?? 'All Items';

  const products = await getProducts({
    category: mainCategory || undefined,
    subCategory: subCategory || undefined,
    brand: brand ? [brand] : undefined,
    size: size ? [size] : undefined,
    price,
    sort: sort as
      | "newest"
      | "price-low"
      | "price-high"
      | "name",
  });

  const categories = await getCategories();
  const brands = await getBrands();

  const categoriesWithSubs = await Promise.all(
    categories.map(async (categoryItem: Category) => ({
      ...categoryItem,
      subCategories: (await getSubCategories(categoryItem.slug)) as SubCategory[],
    }))
  );

  return (
    <div
      className="
    mx-auto
    flex
    w-full
    max-w-[1800px]
    flex-col
   gap-12
    px-4
    py-6

    md:flex-row
    md:px-8

    xl:px-12

    2xl:px-16
  "
    >
      {/* Sidebar Filters */}
      <aside
        className="
    hidden

    md:sticky
    md:top-24
    md:flex
md:w-[280px]
    md:flex-shrink-0
    md:flex-col
    md:self-start

    md:rounded-[28px]
    md:border
    md:border-neutral-200
    md:bg-white

    md:p-7

    md:shadow-[0_12px_40px_rgba(0,0,0,.05)]
  "
      >
        <div className="mb-10 flex items-center justify-between">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-neutral-900">
            Filters
          </h2>
          <button className="
text-[11px]
uppercase
tracking-[0.18em]
font-semibold
text-neutral-500
hover:text-neutral-900
transition-colors
">Clear All</button>
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Category</h3>

          <div className="flex flex-col gap-5">
            {categoriesWithSubs.map((category) => (
              <div key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className={`block rounded-xl px-3 py-2 text-sm transition-all ${mainCategory === category.slug
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
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
                        className={`block rounded-lg px-3 py-2 text-sm transition-all ${mainCategory === category.slug &&
                          subCategory === sub.slug
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
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

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Brand</h3>

          <BrandFilter brands={brands} />
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Size</h3>

          <SizeFilter />
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Price
          </h3>

          <PriceFilter />
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1 max-w-[1220px]">
        <div className="mb-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-500 mb-2 flex items-center gap-2">
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
        </div>

        {/* Toolbar */}
        <div className="mb-8 rounded-3xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div className="flex flex-wrap items-center gap-2">
              {brand && (
                <Link
                  href={`/shop/${mainCategory}${subCategory ? `/${subCategory}` : ""}${size ? `?size=${size}` : ""}`}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                >
                  {brand}
                  <span className="text-neutral-400">✕</span>
                </Link>
              )}

              {size && (
                <Link
                  href={`/shop/${mainCategory}${subCategory ? `/${subCategory}` : ""}${brand ? `?brand=${brand}` : ""}`}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                >
                  Size {size}
                  <span className="text-neutral-400">✕</span>
                </Link>
              )}

              {price && (
                <Link
                  href={`/shop/${mainCategory}${subCategory ? `/${subCategory}` : ""}${brand ? `?brand=${brand}` : ""
                    }${size ? `${brand ? "&" : "?"}size=${size}` : ""}`}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                >
                  {price === "0-499" && "Under ₹499"}
                  {price === "500-999" && "₹500 - ₹999"}
                  {price === "1000-1499" && "₹1000 - ₹1499"}
                  {price === "1500+" && "₹1500+"}

                  <span className="text-neutral-400">✕</span>
                </Link>
              )}
            </div>

            {/* Center */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-600">

              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

              <span>
                Showing
                <span className="mx-1 font-semibold text-black">
                  {products.length}
                </span>
                curated pieces
              </span>

            </div>

            {/* Right */}

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-neutral-500 md:block">
                Sort by
              </span>

              <SortDropdown defaultValue={sort} />
            </div>
          </div>
        </div>
        <div
          className="
    grid
    grid-cols-2

    gap-x-8
    gap-y-12

    lg:grid-cols-3

    xl:gap-x-10
    xl:gap-y-14
  "
        >
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>

        <div className="flex justify-center mt-12 mb-8">
          <button className="
rounded-full
border
border-neutral-900
px-12
py-4
text-[11px]
font-semibold
uppercase
tracking-[0.22em]
transition-all
duration-300
hover:bg-neutral-900
hover:text-white
">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}
