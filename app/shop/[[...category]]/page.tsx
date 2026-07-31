import type { Metadata } from "next";
import { getProducts, getBrands } from "@/lib/services/products";
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
    search?: string;
    page?: string;
    limit?: string;
    view?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category = [] } = await params;
  const { search } = await searchParams;

  const categoryTitle = category[category.length - 1] ?? "";

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

  return {
    title,
    description,
    alternates: {
      canonical: category.length
        ? `/shop/${category.join("/")}`
        : "/shop",
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/shop${category.length ? `/${category.join("/")}` : ""}`,
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
    search,
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
    sort: sort as "newest" | "price-low" | "price-high" | "name",
    limit: 9,
  });

  const genders = await getGenders();
  const categories = await getCategories();
  console.log(categories, "cat");
  console.log(categories.length, "length");
  const brands = await getBrands();

  return (
    <ShopContent
      products={products}
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