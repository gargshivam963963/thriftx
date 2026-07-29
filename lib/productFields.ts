export type FieldType = "text" | "number" | "textarea" | "select";

export type ProductField = {
  name: string;
  label: string;
  type: FieldType;

  section: "product" | "pricing" | "details" | "measurements" | "description";

  ai?: boolean;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  options?: string[];
};

export const PRODUCT_FIELDS: ProductField[] = [
  // ----------------------------
  // Product
  // ----------------------------

  {
    name: "title",
    label: "Product Title",
    type: "text",
    section: "product",
    placeholder: "Vintage Nike T-Shirt",
    ai: true,
    defaultValue: "",
  },

  {
    name: "brand",
    label: "Brand",
    type: "text",
    section: "product",
    placeholder: "Nike",
    ai: true,
    defaultValue: "",
  },

  {
    name: "gender",
    label: "Gender",
    type: "select",
    section: "product",
    ai: true,
    defaultValue: "Unisex",
    options: ["Men", "Women", "Unisex", "Kids"],
  },

  {
    name: "category",
    label: "Category",
    type: "select",
    section: "product",
    ai: true,
    defaultValue: "",
    options: [
      "T-Shirts",
      "Shirts",
      "Hoodies",
      "Sweatshirts",
      "Jackets",
      "Blazers",
      "Tops",
      "Jeans",
      "Cargo",
      "Trousers",
      "Shorts",
      "Skirts",
      "Dresses",
      "Lower",
    ],
  },

  {
    name: "size",
    label: "Size",
    type: "text",
    section: "product",
    placeholder: "M",
    ai: true,
    defaultValue: "",
  },

  // ----------------------------
  // Pricing
  // ----------------------------

  {
    name: "price",
    label: "Selling Price",
    type: "number",
    section: "pricing",
    defaultValue: "299",
  },

  {
    name: "retailPrice",
    label: "Retail Price",
    type: "number",
    section: "pricing",
    defaultValue: "",
  },

  {
    name: "condition",
    label: "Condition",
    type: "select",
    section: "pricing",
    ai: true,
    defaultValue: "Excellent",
    options: [
      "Brand New with Tags",
      "Brand New without Tags",
      "Like New",
      "Excellent",
      "Very Good",
      "Good",
      "Fair",
    ],
  },

  // ----------------------------
  // Details
  // ----------------------------

  {
    name: "color",
    label: "Color",
    type: "text",
    section: "details",
    placeholder: "Black",
    ai: true,
    defaultValue: "",
  },

  {
    name: "material",
    label: "Material",
    type: "text",
    section: "details",
    placeholder: "100% Cotton",
    ai: true,
    defaultValue: "",
  },

  // ----------------------------
  // Measurements
  // ----------------------------

  {
    name: "chest",
    label: "Chest",
    type: "text",
    section: "measurements",
    placeholder: '22"',
    defaultValue: "",
  },

  {
    name: "waist",
    label: "Waist",
    type: "text",
    section: "measurements",
    placeholder: '32"',
    defaultValue: "",
  },

  {
    name: "length",
    label: "Length",
    type: "text",
    section: "measurements",
    placeholder: '29"',
    defaultValue: "",
  },

  // ----------------------------
  // Description
  // ----------------------------

  {
    name: "description",
    label: "Description",
    type: "textarea",
    section: "description",
    ai: true,
    defaultValue: "",
  },

  {
    name: "shippingInfo",
    label: "Shipping Information",
    type: "textarea",
    section: "description",
    defaultValue:
      "Ships within 24 hours. Pan India delivery in 3–7 business days.",
  },
];
