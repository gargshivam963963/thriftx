import * as XLSX from "xlsx";
import { BulkProduct } from "./types";

const REQUIRED_COLUMNS = [
  "sku",
  "gender",
  "category",
  "price",
  "condition",
  "size",
] as const;

function clean(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function numberValue(value: unknown): number | undefined {
  const v = clean(value);

  if (!v) return undefined;

  const n = Number(v);

  return Number.isFinite(n) ? n : undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize Excel headers
 *
 * "Retail Price" -> retailprice
 * "Shipping Info" -> shippinginfo
 * "Product Title" -> producttitle
 */
function normalizeKey(key: string) {
  return key.toLowerCase().trim().replace(/\s+/g, "");
}

function validateHeaders(headers: string[]) {
  const normalized = headers.map(normalizeKey);

  const missing = REQUIRED_COLUMNS.filter(
    (column) => !normalized.includes(column),
  );

  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }
}

export async function parseExcel(file: File): Promise<BulkProduct[]> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error("No worksheet found.");
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (!rawRows.length) {
    return [];
  }

  const rows = rawRows.map((row) => {
    const normalized: Record<string, unknown> = {};

    Object.entries(row).forEach(([key, value]) => {
      normalized[normalizeKey(key)] = value;
    });

    return normalized;
  });

  validateHeaders(Object.keys(rows[0]));

  const skuSet = new Set<string>();

  return rows.map((row, index) => {
    const errors: string[] = [];

    const sku = clean(row.sku);

    if (!sku) errors.push("SKU is missing");

    if (skuSet.has(sku)) {
      errors.push("Duplicate SKU");
    }

    skuSet.add(sku);

    const title = clean(row.title);

    const category = clean(row.category);

    const price = numberValue(row.price);

    if (price === undefined || price <= 0) {
      errors.push("Invalid price");
    }

    const retailPrice = numberValue(row.retailprice);

    const gender = clean(row.gender) as BulkProduct["gender"];

    if (!["Men", "Women", "Kids", "Unisex"].includes(gender)) {
      errors.push("Invalid gender");
    }

    return {
      row: index + 2,

      sku,

      title,

      brand: clean(row.brand),

      slug: slugify(title || sku),

      gender,

      category,

      categorySlug: slugify(category),

      price: price ?? 0,

      retailPrice,

      condition: clean(row.condition),

      size: clean(row.size),

      chest: clean(row.chest),

      waist: clean(row.waist),

      length: clean(row.length),

      inseam: clean(row.inseam),

      color: clean(row.color),

      material: clean(row.material),

      description: clean(row.description),

      shippingInfo: clean(row.shippinginfo),

      imageFiles: [],

      imageUrls: [],

      primaryImage: undefined,

      aiGenerated: false,

      status: errors.length === 0 ? "Ready" : "Invalid",

      errors,
    };
  });
}
