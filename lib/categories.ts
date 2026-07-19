import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_CATEGORIES_COLLECTION_ID,
  APPWRITE_GENDERS_COLLECTION_ID,
  AppwriteQuery,
  isAppwriteDataConfigured,
} from "./appwrite";

export type Gender = {
  id: string;
  slug: string;
  name: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  gender: "Men" | "Women" | "Kids" | "Unisex";
  order: number;
  active: boolean;
  image?: string;
};

const FALLBACK_GENDERS: Gender[] = [
  {
    id: "gender-men",
    slug: "men",
    name: "Men",
  },
  {
    id: "gender-women",
    slug: "women",
    name: "Women",
  },
  {
    id: "gender-kids",
    slug: "kids",
    name: "Kids",
  },
  {
    id: "gender-unisex",
    slug: "unisex",
    name: "Unisex",
  },
];

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "cat-men-tshirts",
    slug: "t-shirts",
    name: "T-Shirts",
    gender: "Men",
    order: 1,
    active: true,
  },
  {
    id: "cat-men-shirts",
    slug: "shirts",
    name: "Shirts",
    gender: "Men",
    order: 2,
    active: true,
  },
  {
    id: "cat-men-jeans",
    slug: "jeans",
    name: "Jeans",
    gender: "Men",
    order: 3,
    active: true,
  },
  {
    id: "cat-men-hoodies",
    slug: "hoodies",
    name: "Hoodies",
    gender: "Men",
    order: 4,
    active: true,
  },
  {
    id: "cat-men-jackets",
    slug: "jackets",
    name: "Jackets",
    gender: "Men",
    order: 5,
    active: true,
  },
  {
    id: "cat-men-sweatshirts",
    slug: "sweatshirts",
    name: "Sweatshirts",
    gender: "Men",
    order: 6,
    active: true,
  },
  {
    id: "cat-men-shorts",
    slug: "shorts",
    name: "Shorts",
    gender: "Men",
    order: 7,
    active: true,
  },
  {
    id: "cat-men-trousers",
    slug: "trousers",
    name: "Trousers",
    gender: "Men",
    order: 8,
    active: true,
  },
  {
    id: "cat-women-dresses",
    slug: "dresses",
    name: "Dresses",
    gender: "Women",
    order: 9,
    active: true,
  },
  {
    id: "cat-women-tops",
    slug: "tops",
    name: "Tops",
    gender: "Women",
    order: 10,
    active: true,
  },
  {
    id: "cat-women-jeans",
    slug: "jeans",
    name: "Jeans",
    gender: "Women",
    order: 11,
    active: true,
  },
  {
    id: "cat-women-skirts",
    slug: "skirts",
    name: "Skirts",
    gender: "Women",
    order: 12,
    active: true,
  },
  {
    id: "cat-women-hoodies",
    slug: "hoodies",
    name: "Hoodies",
    gender: "Women",
    order: 13,
    active: true,
  },
  {
    id: "cat-women-jackets",
    slug: "jackets",
    name: "Jackets",
    gender: "Women",
    order: 14,
    active: true,
  },
  {
    id: "cat-kids-tshirts",
    slug: "t-shirts",
    name: "T-Shirts",
    gender: "Kids",
    order: 15,
    active: true,
  },
  {
    id: "cat-kids-shorts",
    slug: "shorts",
    name: "Shorts",
    gender: "Kids",
    order: 16,
    active: true,
  },
  {
    id: "cat-kids-jeans",
    slug: "jeans",
    name: "Jeans",
    gender: "Kids",
    order: 17,
    active: true,
  },
  {
    id: "cat-kids-hoodies",
    slug: "hoodies",
    name: "Hoodies",
    gender: "Kids",
    order: 18,
    active: true,
  },
  {
    id: "cat-unisex-hoodies",
    slug: "hoodies",
    name: "Hoodies",
    gender: "Unisex",
    order: 19,
    active: true,
  },
  {
    id: "cat-unisex-jackets",
    slug: "jackets",
    name: "Jackets",
    gender: "Unisex",
    order: 20,
    active: true,
  },
  {
    id: "cat-unisex-sweatshirts",
    slug: "sweatshirts",
    name: "Sweatshirts",
    gender: "Unisex",
    order: 21,
    active: true,
  },
];

export async function getGenders(): Promise<Gender[]> {
  if (!isAppwriteDataConfigured) {
    return FALLBACK_GENDERS;
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_GENDERS_COLLECTION_ID,
    [AppwriteQuery.equal("active", true), AppwriteQuery.orderAsc("order")],
  );

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    slug: doc.slug,
    name: doc.name,
  }));
}

export async function getCategories(): Promise<Category[]> {
  if (!isAppwriteDataConfigured) {
    return FALLBACK_CATEGORIES;
  }

  const response = await databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_CATEGORIES_COLLECTION_ID,
    [AppwriteQuery.equal("active", true), AppwriteQuery.orderAsc("order")],
  );

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    slug: doc.slug,
    name: doc.name,
    gender: doc.gender,
    order: doc.order,
    active: doc.active,
    image: doc.image ?? "",
  }));
}
