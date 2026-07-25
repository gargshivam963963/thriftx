import Link from "next/link";
import { getProducts, getBrands } from "@/lib/services/products";
import { getCategories, getGenders } from "@/lib/categories";
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
    limit: 48,
  });

  const genders = await getGenders();
  const categories = await getCategories();
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

