import path from "path";

import { readProductsCSV } from "./csv";
import { validateProduct } from "./validation";
import { uploadImages } from "./uploadImages";
import { createProduct } from "./createProducts";
import { report, printReport } from "./report";

async function run() {
  const csvPath = path.join(process.cwd(), "scripts", "bulk", "products.csv");

  const imageFolder = path.join(process.cwd(), "scripts", "bulk", "images");

  const products = await readProductsCSV(csvPath);

  console.log(`Found ${products.length} products\n`);

  const usedSkus = new Set<string>();

  for (const product of products) {
    console.log(`Processing ${product.sku}...`);

    const validation = validateProduct(product, imageFolder, usedSkus);

    if (!validation.valid) {
      report.failed++;

      report.failedProducts.push({
        sku: product.sku,
        errors: validation.errors,
      });

      console.log("Skipped\n");

      continue;
    }

    try {
      const uploadedImages = await uploadImages(product.sku, imageFolder);

      await createProduct(product, uploadedImages);

      report.success++;

      report.successProducts.push(product.sku);

      console.log("Completed\n");
    } catch (error) {
      report.failed++;

      report.failedProducts.push({
        sku: product.sku,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });

      console.log("Failed\n");
    }
  }

  printReport();
}

run().catch(console.error);
