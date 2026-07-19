import { config } from "dotenv";

config({ path: ".env.local" });

console.log("ENV:", process.cwd());
console.log("ENDPOINT:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log("PROJECT:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

import { Client, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;

const categories = [
  // Men
  {
    name: "T-Shirts",
    slug: "t-shirts",
    gender: "Men",
    order: 1,
    active: true,
  },
  {
    name: "Shirts",
    slug: "shirts",
    gender: "Men",
    order: 2,
    active: true,
  },
  {
    name: "Jeans",
    slug: "jeans",
    gender: "Men",
    order: 3,
    active: true,
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    gender: "Men",
    order: 4,
    active: true,
  },
  {
    name: "Jackets",
    slug: "jackets",
    gender: "Men",
    order: 5,
    active: true,
  },
  {
    name: "Sweatshirts",
    slug: "sweatshirts",
    gender: "Men",
    order: 6,
    active: true,
  },
  {
    name: "Shorts",
    slug: "shorts",
    gender: "Men",
    order: 7,
    active: true,
  },
  {
    name: "Trousers",
    slug: "trousers",
    gender: "Men",
    order: 8,
    active: true,
  },

  // Women
  {
    name: "Dresses",
    slug: "dresses",
    gender: "Women",
    order: 9,
    active: true,
  },
  {
    name: "Tops",
    slug: "tops",
    gender: "Women",
    order: 10,
    active: true,
  },
  {
    name: "Jeans",
    slug: "jeans",
    gender: "Women",
    order: 11,
    active: true,
  },
  {
    name: "Skirts",
    slug: "skirts",
    gender: "Women",
    order: 12,
    active: true,
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    gender: "Women",
    order: 13,
    active: true,
  },
  {
    name: "Jackets",
    slug: "jackets",
    gender: "Women",
    order: 14,
    active: true,
  },

  // Kids
  {
    name: "T-Shirts",
    slug: "t-shirts",
    gender: "Kids",
    order: 15,
    active: true,
  },
  {
    name: "Shorts",
    slug: "shorts",
    gender: "Kids",
    order: 16,
    active: true,
  },
  {
    name: "Jeans",
    slug: "jeans",
    gender: "Kids",
    order: 17,
    active: true,
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    gender: "Kids",
    order: 18,
    active: true,
  },

  // Unisex
  {
    name: "Hoodies",
    slug: "hoodies",
    gender: "Unisex",
    order: 19,
    active: true,
  },
  {
    name: "Jackets",
    slug: "jackets",
    gender: "Unisex",
    order: 20,
    active: true,
  },
  {
    name: "Sweatshirts",
    slug: "sweatshirts",
    gender: "Unisex",
    order: 21,
    active: true,
  },
];

async function seedCategories() {
  console.log("🚀 Seeding categories...\n");

  for (const category of categories) {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("slug", category.slug),
      Query.equal("gender", category.gender),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      console.log(`⏩ Skipped ${category.gender} → ${category.name}`);
      continue;
    }

    await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
      ...category,
      image: "",
    });

    console.log(`✅ Created ${category.gender} → ${category.name}`);
  }

  console.log("\n🎉 Categories seeded successfully.");
}

seedCategories().catch(console.error);
