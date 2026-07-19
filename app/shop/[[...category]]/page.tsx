import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal } from "lucide-react";
import { getProducts, getBrands } from "@/lib/services/products";
import { getCategories, getGenders } from "@/lib/categories";
import SortDropdown from "@/components/shop/SortDropdown";
import BrandFilter from "@/components/shop/BrandFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import PriceFilter from "@/components/shop/PriceFilter";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

type Category = {
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

  const gender = category[0] ?? "";
  const clothingCategory = category[1] ?? "";
  const categoryTitle = category[category.length - 1] ?? "All Items";

  const products = await getProducts({
    gender: gender || undefined,
    category: clothingCategory || undefined,
    brand: brand ? [brand] : undefined,
    size: size ? [size] : undefined,
    price,
    sort: sort as
      | "newest"
      | "price-low"
      | "price-high"
      | "name",
  });

  const genders = await getGenders();
  const categories = await getCategories();
  const brands = await getBrands();

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

          <button
            className="
              text-[11px]
              uppercase
              tracking-[0.18em]
              font-semibold
              text-neutral-500
              hover:text-neutral-900
              transition-colors
            "
          >
            Clear All
          </button>
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Category
          </h3>

          <Accordion.Root
            type="multiple"
            defaultValue={[gender || "men"]}
            className="space-y-2"
          >
            {genders.map((genderItem) => (
              <Accordion.Item
                key={genderItem.id}
                value={genderItem.slug}
                className="rounded-xl border border-neutral-200 overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className="
              group
              flex
              w-full
              items-center
              justify-between
              px-4
              py-3
              text-left
              font-semibold
              hover:bg-neutral-50
              transition-colors
            "
                  >
                    <span>{genderItem.name}</span>

                    <ChevronDown
                      size={16}
                      className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="overflow-hidden px-4 pb-4">
                  <div className="flex flex-col gap-2">
                    {categories
                      .filter(
                        (category) =>
                          category.gender.toLowerCase() ===
                          genderItem.name.toLowerCase(),
                      )
                      .map((category) => (
                        <Link
                          key={category.id}
                          href={`/shop/${genderItem.slug}/${category.slug}`}
                          className={`rounded-lg px-3 py-2 text-sm transition-all ${gender === genderItem.slug &&
                            clothingCategory === category.slug
                            ? "bg-black text-white"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                            }`}
                        >
                          {category.name}
                        </Link>
                      ))}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Brand
          </h3>

          <BrandFilter brands={brands} />
        </div>

        <div className="pb-8">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Size
          </h3>

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
          <div className="mb-2 flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-500">
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

                <span
                  className={
                    i === category.length - 1
                      ? "font-semibold text-black"
                      : "hover:text-black"
                  }
                >
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
                  href={`/shop/${gender}/${clothingCategory}`}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                >
                  {brand}
                  <span className="text-neutral-400">✕</span>
                </Link>
              )}

              {size && (
                <Link
                  href={`/shop/${gender}/${clothingCategory}${brand ? `?brand=${brand}` : ""
                    }`}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-200"
                >
                  Size {size}
                  <span className="text-neutral-400">✕</span>
                </Link>
              )}

              {price && (
                <Link
                  href={`/shop/${gender}/${clothingCategory}${brand ? `?brand=${brand}` : ""
                    }${size
                      ? `${brand ? "&" : "?"}size=${size}`
                      : ""
                    }`}
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
            <ProductCard
              key={p.id}
              id={p.id}
              brand={p.brand}
              title={p.title}
              price={p.price}
              condition={p.condition}
              image={p.primaryImage}
            />
          ))}
        </div>

        <div className="mt-12 mb-8 flex justify-center">
          <button
            className="
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
            "
          >
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}