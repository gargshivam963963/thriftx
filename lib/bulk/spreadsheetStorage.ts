"use client";

import type { BulkProduct } from "@/app/lib/bulk/types";

const STORAGE_PREFIX = "thriftx_spreadsheet_";
const DRAFT_KEY = STORAGE_PREFIX + "draft";
const DB_NAME = "thriftx_bulk_draft";
const DB_VERSION = 1;
const IMAGE_STORE = "images";

type DraftData = {
  products: BulkProduct[];
  nextSkuNumber: number;
  lastSaved: number;
};

type StoredImage = {
  id: string;
  sku: string;
  index: number;
  name: string;
  type: string;
  lastModified: number;
  file: Blob;
};

type DraftProduct = BulkProduct & {
  _savedImageCount?: number;
};

let saveQueue: Promise<void> = Promise.resolve();
const savedImageSignatures = new Map<string, string>();

function generateSku(index: number): string {
  return `TX${String(index).padStart(3, "0")}`;
}

function canUseIndexedDb(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(
      DB_NAME,
      DB_VERSION,
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        const store = db.createObjectStore(
          IMAGE_STORE,
          { keyPath: "id" },
        );
        store.createIndex(
          "sku",
          "sku",
          { unique: false },
        );
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function imageSignature(file: File): string {
  return [
    file.name,
    file.size,
    file.type,
    file.lastModified,
  ].join(":");
}

function productImageSignature(
  product: BulkProduct,
): string {
  return product.imageFiles
    .map(imageSignature)
    .join("|");
}

async function saveImages(
  products: BulkProduct[],
): Promise<void> {
  if (!canUseIndexedDb()) return;

  const db = await openImageDb();

  try {
    const currentIds = new Set<string>();
    const transaction = db.transaction(
      IMAGE_STORE,
      "readwrite",
    );
    const store = transaction.objectStore(
      IMAGE_STORE,
    );

    for (const product of products) {
      const signature = productImageSignature(product);

      for (
        let index = 0;
        index < product.imageFiles.length;
        index += 1
      ) {
        const file = product.imageFiles[index];
        const id = `${product.sku}:${index}`;
        currentIds.add(id);

        if (
          savedImageSignatures.get(product.sku) ===
          signature
        ) {
          continue;
        }

        store.put({
          id,
          sku: product.sku,
          index,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          file,
        } satisfies StoredImage);
      }

      savedImageSignatures.set(
        product.sku,
        signature,
      );
    }

    await new Promise<void>(
      (resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error);
        transaction.onabort = () =>
          reject(transaction.error);
      },
    );

    // Remove images belonging to products that no longer exist.
    const cleanupDb = await openImageDb();
    const cleanupTx = cleanupDb.transaction(
      IMAGE_STORE,
      "readwrite",
    );
    const cleanupStore = cleanupTx.objectStore(
      IMAGE_STORE,
    );
    const allRequest = cleanupStore.getAll();

    await new Promise<void>((resolve, reject) => {
      allRequest.onsuccess = () => {
        const records = allRequest.result as StoredImage[];
        const activeSkus = new Set(
          products.map((product) => product.sku),
        );

        for (const record of records) {
          if (!activeSkus.has(record.sku)) {
            cleanupStore.delete(record.id);
          }
        }
      };

      allRequest.onerror = () =>
        reject(allRequest.error);

      cleanupTx.oncomplete = () => resolve();
      cleanupTx.onerror = () =>
        reject(cleanupTx.error);
      cleanupTx.onabort = () =>
        reject(cleanupTx.error);
    });

    cleanupDb.close();
  } finally {
    db.close();
  }
}

async function loadImages(
  products: BulkProduct[],
): Promise<BulkProduct[]> {
  if (!canUseIndexedDb()) {
    return products;
  }

  const db = await openImageDb();

  try {
    const transaction = db.transaction(
      IMAGE_STORE,
      "readonly",
    );
    const store = transaction.objectStore(
      IMAGE_STORE,
    );
    const request = store.getAll();

    const records = await new Promise<StoredImage[]>(
      (resolve, reject) => {
        request.onsuccess = () =>
          resolve(request.result as StoredImage[]);
        request.onerror = () =>
          reject(request.error);
      },
    );

    const bySku = new Map<string, StoredImage[]>();

    for (const record of records) {
      const existing =
        bySku.get(record.sku) ?? [];
      existing.push(record);
      bySku.set(record.sku, existing);
    }

    const restored = products.map((product) => {
      const stored = (
        bySku.get(product.sku) ?? []
      ).sort(
        (a, b) => a.index - b.index,
      );

      const files = stored.map(
        (record) =>
          record.file instanceof File
            ? record.file
            : new File(
                [record.file],
                record.name,
                {
                  type: record.type,
                  lastModified:
                    record.lastModified,
                },
              ),
      );

      const imageUrls = files.map((file) =>
        URL.createObjectURL(file),
      );

      savedImageSignatures.set(
        product.sku,
        files.map(imageSignature).join("|"),
      );

      if (files.length === 0) {
        return {
          ...product,
          imageFiles: [],
          imageUrls: [],
          primaryImage: undefined,
          status:
            product.status === "Uploaded"
              ? product.status
              : product.status,
        };
      }

      return {
        ...product,
        imageFiles: files,
        imageUrls,
        primaryImage: imageUrls[0],
        errors: product.errors.filter(
          (error) =>
            !error.toLowerCase().includes(
              "image",
            ),
        ),
      };
    });

    return restored;
  } finally {
    db.close();
  }
}

export async function loadDraft(): Promise<DraftData> {
  if (typeof window === "undefined") {
    return {
      products: [],
      nextSkuNumber: 1,
      lastSaved: Date.now(),
    };
  }

  try {
    const raw = localStorage.getItem(
      DRAFT_KEY,
    );

    if (!raw) {
      return {
        products: [],
        nextSkuNumber: 1,
        lastSaved: Date.now(),
      };
    }

    const parsed = JSON.parse(raw) as DraftData;
    const metadataProducts = parsed.products.map(
      (product) => {
        const savedImageCount = Number(
          (product as DraftProduct)
            ._savedImageCount ??
            0,
        );

        return {
          ...product,
          imageFiles: [],
          imageUrls: [],
          primaryImage: undefined,
          status:
            product.status === "Uploaded" &&
            product.productId
              ? "Uploaded"
              : savedImageCount > 0
                ? "Missing Images"
                : product.status,
          errors:
            product.status === "Uploaded" &&
            product.productId
              ? []
              : savedImageCount > 0
                ? [
                    "Restoring saved images...",
                  ]
                : product.errors,
        };
      },
    );

    const restored = await loadImages(
      metadataProducts,
    );

    return {
      products: restored,
      nextSkuNumber:
        parsed.nextSkuNumber ?? 1,
      lastSaved:
        parsed.lastSaved ?? Date.now(),
    };
  } catch (error) {
    console.warn(
      "Failed to load spreadsheet draft:",
      error,
    );
  }

  return {
    products: [],
    nextSkuNumber: 1,
    lastSaved: Date.now(),
  };
}

export function saveDraft(
  products: BulkProduct[],
  nextSkuNumber?: number,
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  saveQueue = saveQueue
    .catch(() => undefined)
    .then(async () => {
      try {
        const serializable = products.map(
          (product) => ({
            ...product,
            imageFiles: [],
            imageUrls: [],
            primaryImage: undefined,
            _savedImageCount:
              product.imageFiles.length,
          }),
        );

        const data: DraftData = {
          products:
            serializable as BulkProduct[],
          nextSkuNumber:
            nextSkuNumber ?? products.length + 1,
          lastSaved: Date.now(),
        };

        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify(data),
        );

        await saveImages(products);
      } catch (error) {
        console.warn(
          "Failed to save spreadsheet draft:",
          error,
        );
      }
    });

  return saveQueue;
}

export async function clearDraft(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DRAFT_KEY);
    savedImageSignatures.clear();

    if (!canUseIndexedDb()) return;

    const db = await openImageDb();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        IMAGE_STORE,
        "readwrite",
      );
      const request = transaction
        .objectStore(IMAGE_STORE)
        .clear();

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error);
    });

    db.close();
  } catch (error) {
    console.warn(
      "Failed to clear spreadsheet draft:",
      error,
    );
  }
}

export function createBlankProduct(
  skuNumber: number,
): BulkProduct {
  return {
    row: skuNumber,
    sku: generateSku(skuNumber),
    title: "",
    brand: "",
    slug: "",
    gender: "Unisex",
    category: "",
    categorySlug: "",
    price: 0,
    condition: "Excellent",
    size: "",
    chest: "",
    waist: "",
    length: "",
    color: "",
    material: "",
    description: "",
    shippingInfo: "",
    imageFiles: [],
    imageUrls: [],
    aiGenerated: false,
    status: "Missing Images",
    errors: ["Add at least one image."],
  };
}

export { generateSku };
