import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Query,
  getDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";

export interface Product {
  id: string;
  brand: string;
  title: string;
  price: string;
  condition: string;
  image: string;
  category: string;
  subCategory: string;
  onlyOneLeft?: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', brand: "Levi's", title: 'Vintage 501s 1990s Made in USA', price: '₹4,500', condition: '9/10', image: 'https://picsum.photos/seed/jeans1/800/1000', category: 'men', subCategory: 'jeans', onlyOneLeft: true },
  { id: '2', brand: 'Stüssy', title: 'Faded Arch Logo Hoodie', price: '₹6,000', condition: '8/10', image: 'https://picsum.photos/seed/hoodie1/800/1000', category: 'men', subCategory: 'hoodies', onlyOneLeft: true },
  { id: '3', brand: 'Carhartt WIP', title: 'Detroit Jacket Faded Brown', price: '₹8,500', condition: '7.5/10', image: 'https://picsum.photos/seed/jacket1/800/1000', category: 'men', subCategory: 'jackets', onlyOneLeft: true },
  { id: '4', brand: 'Vintage', title: 'Racing Leather Jacket', price: '₹12,000', condition: '8/10', image: 'https://picsum.photos/seed/leather1/800/1000', category: 'men', subCategory: 'jackets', onlyOneLeft: true },
  { id: '5', brand: 'Acne Studios', title: 'Max Stay Cash Black Jeans', price: '₹7,000', condition: '9.5/10', image: 'https://picsum.photos/seed/jeans2/800/1000', category: 'men', subCategory: 'jeans', onlyOneLeft: false },
  { id: '6', brand: 'Supreme', title: 'Box Logo Tee White (2014)', price: '₹15,000', condition: '8/10', image: 'https://picsum.photos/seed/tee1/800/1000', category: 'men', subCategory: 't-shirts', onlyOneLeft: true },
  { id: '7', brand: 'Reformation', title: 'Floral Midi Dress', price: '₹5,500', condition: '9/10', image: 'https://picsum.photos/seed/dress1/800/1000', category: 'women', subCategory: 'dresses', onlyOneLeft: true },
  { id: '8', brand: 'Vintage', title: 'Silk Slip Dress', price: '₹3,000', condition: '8/10', image: 'https://picsum.photos/seed/dress2/800/1000', category: 'women', subCategory: 'dresses', onlyOneLeft: true },
];

export async function seedProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(productsRef, p.id), p);
      }
      console.log('Seeded products into Firestore.');
      return { seeded: true };
    }
    return { seeded: false };
  } catch (err) {
    console.error('seedProducts error', err);
    throw err;
  }
}

import { setDoc } from 'firebase/firestore';

export async function getProducts(
  category?: string,
  subCategory?: string,
  pageSize = 48
): Promise<Product[]> {
  try {
    console.log(`[getProducts] category=${category ?? ''} subCategory=${subCategory ?? ''} pageSize=${pageSize}`);
    const productsRef = collection(db, "products");

    let q: Query;

    if (category && subCategory) {
        // Avoid ordering when using multiple equality filters (composite index may be required).
        q = query(
          productsRef,
          where("category", "==", category),
          where("subCategory", "==", subCategory),
          limit(pageSize)
        );
    } else if (category) {
        // Avoid ordering with equality filter to prevent composite index requirement.
        q = query(productsRef, where("category", "==", category), limit(pageSize));
    } else {
      q = query(productsRef, orderBy("title"), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    console.log(`[getProducts] snapshot size=${snapshot.size}`);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Product),
    }));
  } catch (error) {
    console.error('[getProducts] error', error);
    return [];
  }
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  try {
    console.log(`[getProductById] id=${id}`);
    const snap = await getDoc(doc(db, "products", id));

    if (!snap.exists()) {
      console.log(`[getProductById] not found id=${id}`);
      return null;
    }

    return {
      id: snap.id,
      ...(snap.data() as Product),
    };
  } catch (error) {
    console.error('[getProductById] error', error);
    return null;
  }
}