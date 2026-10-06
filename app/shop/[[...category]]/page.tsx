import type { Metadata } from "next";
import { countProducts, getProducts, getBrands } from "@/lib/services/products";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants/products";
import { getCategories, getGenders } from "@/lib/categories";
import { siteConfig } from "@/lib/seo";
import ShopContent from "./ShopContent";

type PageProps = {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    size?: string;
    price?: string;
    measurement?: string;
    color?: string;
    material?: string;
    condition?: string;
    search?: string;
    page?: string;
    limit?: string;
    pageSize?: string;
    view?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category = [] } = await params;
  const { search, page } = await searchParams;

  const categoryTitle = category[category.length - 1] ?? "";
  // Page 1 is the canonical collection; deeper pages are self-canonical so the
  // pager doesn't flood the index with near-duplicate URLs.
  const isFirstPage = !page || page === "1";

  const title = categoryTitle
    ? `${categoryTitle} | Shop THRIFTX`
    : search
      ? `Search: ${search} | THRIFTX`
      : "Shop Premium Thrift Clothing | THRIFTX";

  const description = categoryTitle
    ? `Browse premium branded ${categoryTitle.toLowerCase()} at THRIFTX. Authentic thrift fashion, quality checked, affordable prices.`
    : search
      ? `Search results for "${search}" at THRIFTX. Find premium branded thrift clothing.`
      : "Shop premium branded thrift clothing online. Authentic Nike, Adidas, Puma, Polo Ralph Lauren and more at affordable prices.";

  const canonicalPath = category.length
    ? `/shop/${category.join("/")}`
    : "/shop";

  return {
    title,
    description,
    alternates: {
      canonical: isFirstPage ? canonicalPath : `${canonicalPath}?page=${page}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${canonicalPath}${isFirstPage ? "" : `?page=${page}`}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Shop({ params, searchParams }: PageProps) {
  const { category = [] } = await params;

  const {
    sort = "newest",
    brand,
    size,
    price,
    measurement,
    color,
    material,
    condition,
    search,
    page,
    pageSize: rawPageSize,
  } = await searchParams;

  // Shopper-selectable page size (20 / 50 / 100, default 50). Any other
  // value falls back to the default so a tampered `?pageSize=` can't break
  // the grid or the SEO canonicals.
  const parsedPageSize = Number.parseInt(rawPageSize || "", 10);
  const pageSize = (
    PAGE_SIZE_OPTIONS as readonly number[]
  ).includes(parsedPageSize)
    ? parsedPageSize
    : DEFAULT_PAGE_SIZE;

  const gender = category[0] ?? "";
  const clothingCategory = category[1] ?? "";
  const categoryTitle = category[category.length - 1] ?? "All Items";

  const filters = {
    gender: gender || undefined,
    category: clothingCategory || undefined,
    brand: brand ? [brand] : undefined,
    size: size ? [size] : undefined,
    price,
    color,
    material,
    condition: condition ? [condition] : undefined,
    search,
    sort: sort as "newest" | "price-low" | "price-high" | "name",
  };

  // Server-driven pagination. The page is clamped rather than 404'd so an
  // out-of-range `?page=` (stale bookmark, emptied filter set) always lands the
  // shopper on a valid, populated page instead of an empty grid.
  const total = await countProducts(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(
    Math.max(1, Number.parseInt(page || "1", 10) || 1),
    totalPages,
  );

  const products = await getProducts({
    ...filters,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const genders = await getGenders();
  const categories = await getCategories();
  const brands = await getBrands();

  return (
    <ShopContent
      products={products}
      total={total}
      page={currentPage}
      pageSize={pageSize}
      genders={genders}
      categories={categories}
      brands={brands}
      gender={gender}
      clothingCategory={clothingCategory}
      categoryTitle={categoryTitle}
      category={category}
      initialSort={sort}
      initialBrand={brand}
      initialSize={size}
      initialPrice={price}
      initialMeasurement={measurement}
      initialSearch={search}
    />
  );
}