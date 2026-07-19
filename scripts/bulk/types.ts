export interface CsvProduct {
  sku: string;

  title: string;

  brand: string;

  gender: "Men" | "Women" | "Kids" | "Unisex";

  category: string;

  price: string;

  retailPrice: string;

  condition: string;

  size: string;

  color: string;

  material: string;

  description: string;

  shippingInfo: string;
}
