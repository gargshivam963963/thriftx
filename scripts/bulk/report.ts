export interface ImportReport {
  success: number;
  failed: number;

  successProducts: string[];

  failedProducts: {
    sku: string;
    errors: string[];
  }[];
}

export const report: ImportReport = {
  success: 0,
  failed: 0,

  successProducts: [],

  failedProducts: [],
};

export function printReport() {
  console.log("\n==========================");
  console.log(" BULK IMPORT REPORT");
  console.log("==========================");

  console.log(`\nSuccess : ${report.success}`);
  console.log(`Failed  : ${report.failed}`);

  if (report.successProducts.length) {
    console.log("\nUploaded Products:");

    report.successProducts.forEach((sku) => {
      console.log(`✔ ${sku}`);
    });
  }

  if (report.failedProducts.length) {
    console.log("\nFailed Products:");

    report.failedProducts.forEach((item) => {
      console.log(`\n${item.sku}`);

      item.errors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    });
  }

  console.log("\n==========================");
}
