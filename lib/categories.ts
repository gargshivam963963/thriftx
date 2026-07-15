import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export async function getCategories() {
  const snapshot = await getDocs(
    query(
      collection(db, "categories"),
      where("active", "==", true),
      orderBy("order"),
    ),
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getSubCategories(category: string) {
  const snapshot = await getDocs(
    query(
      collection(db, "subCategories"),
      where("category", "==", category),
      where("active", "==", true),
      orderBy("order"),
    ),
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}