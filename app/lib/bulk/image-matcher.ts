import { BulkProduct } from "./types";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function isImage(file: File) {
  const name = file.name.toLowerCase();

  return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "").replace(/_/g, "-");
}

function getSkuFromFile(file: File) {
  const path = (
    file as File & {
      webkitRelativePath?: string;
    }
  ).webkitRelativePath;

  if (path) {
    const parts = path.split("/");

    // images/TX001/1.jpg
    if (parts.length >= 3) {
      return normalize(parts[1]);
    }

    // TX001/1.jpg
    if (parts.length >= 2) {
      return normalize(parts[0]);
    }
  }

  if (path) {
    const parts = path.split("/");

    // Folder upload:
    // MEN001/1.jpg
    if (parts.length > 1) {
      return normalize(parts[0]);
    }
  }

  // Filename upload:
  // MEN001-1.jpg
  // MEN001_front.png

  const fileName = file.name.replace(/\.[^.]+$/, "").replace(/_/g, "-");

  return normalize(fileName.split("-")[0]);
}

export function matchImages(products: BulkProduct[], files: File[]) {
  const imageFiles = files.filter(isImage);

  const map = new Map<string, File[]>();

  for (const file of imageFiles) {
    const sku = getSkuFromFile(file);

    if (!map.has(sku)) {
      map.set(sku, []);
    }

    map.get(sku)!.push(file);
  }

  return products.map((product) => {
    const sku = normalize(product.sku);

    const matched = map.get(sku) ?? [];

    matched.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
      }),
    );

    const errors = product.errors.filter(
      (error) => error !== "No images found.",
    );

    if (matched.length === 0) {
      errors.push("No images found.");
    }
    const imageUrls = matched.map((file) => URL.createObjectURL(file));
    const updatedProduct: BulkProduct = {
      ...product,

      imageFiles: matched,
      imageUrls,
      primaryImage: imageUrls[0],

      status: errors.length === 0 ? "Ready" : "Missing Images",

      errors,
    };

    return updatedProduct;
  });
}
