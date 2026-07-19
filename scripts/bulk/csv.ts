import fs from "fs";
import csv from "csv-parser";

import { CsvProduct } from "./types";

export async function readProductsCSV(filePath: string): Promise<CsvProduct[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvProduct[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push({
          sku: String(row.sku ?? "").trim(),

          title: String(row.title ?? "").trim(),

          brand: String(row.brand ?? "").trim(),

          gender: String(row.gender ?? "").trim() as CsvProduct["gender"],

          category: String(row.category ?? "").trim(),

          price: String(row.price ?? "").trim(),

          retailPrice: String(row.retailPrice ?? "").trim(),

          condition: String(row.condition ?? "").trim(),

          size: String(row.size ?? "").trim(),

          color: String(row.color ?? "").trim(),

          material: String(row.material ?? "").trim(),

          description: String(row.description ?? "").trim(),

          shippingInfo: String(row.shippingInfo ?? "").trim(),
        });
      })
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}
