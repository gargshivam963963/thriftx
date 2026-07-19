"use client";

import { Shirt } from "lucide-react";
import { PRODUCT_FIELDS } from "@/lib/productFields";

interface ProductInformationProps {
    form: Record<string, string>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    renderField: (
        field: (typeof PRODUCT_FIELDS)[number]
    ) => React.ReactNode;
}

const CATEGORY_MEASUREMENTS: Record<
    string,
    {
        key: string;
        label: string;
        placeholder: string;
    }[]
> = {
    "t-shirts": [
        { key: "chest", label: "Chest", placeholder: '22"' },
        { key: "length", label: "Length", placeholder: '29"' },
        { key: "shoulder", label: "Shoulder", placeholder: '19"' },
    ],

    shirts: [
        { key: "chest", label: "Chest", placeholder: '22"' },
        { key: "length", label: "Length", placeholder: '30"' },
        { key: "shoulder", label: "Shoulder", placeholder: '18"' },
        { key: "sleeve", label: "Sleeve", placeholder: '25"' },
    ],

    hoodies: [
        { key: "chest", label: "Chest", placeholder: '24"' },
        { key: "length", label: "Length", placeholder: '28"' },
    ],

    jeans: [
        { key: "waist", label: "Waist", placeholder: '34"' },
        { key: "inseam", label: "Inseam", placeholder: '30"' },
        { key: "length", label: "Length", placeholder: '42"' },
    ],

    trousers: [
        { key: "waist", label: "Waist", placeholder: '34"' },
        { key: "inseam", label: "Inseam", placeholder: '31"' },
        { key: "length", label: "Length", placeholder: '41"' },
    ],

    shorts: [
        { key: "waist", label: "Waist", placeholder: '34"' },
        { key: "length", label: "Length", placeholder: '20"' },
    ],

    default: [
        { key: "chest", label: "Chest", placeholder: '22"' },
        { key: "waist", label: "Waist", placeholder: '34"' },
    ],
};

const measurements =
    CATEGORY_MEASUREMENTS[form.categorySlug] ??
    CATEGORY_MEASUREMENTS.default;

export default function ProductInformation({
    form,
    handleChange,
    renderField,
}: ProductInformationProps) {
    const productFields = PRODUCT_FIELDS.filter(
        (field) => field.section === "product"
    );

    const pricingFields = PRODUCT_FIELDS.filter(
        (field) => field.section === "pricing"
    );

    const detailFields = PRODUCT_FIELDS.filter(
        (field) => field.section === "details"
    );

    const descriptionLength =
        form.description?.length || 0;

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

            {/* Header */}

            <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">

                    <Shirt size={22} />

                </div>

                <div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Product Information
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Complete all product details before publishing.
                    </p>

                </div>

            </div>

            <div className="mt-8 space-y-8">

                {/* Basic Details */}
                <div>
                    <div className="mb-5">

                        <h3 className="text-lg font-semibold">
                            Basic Details
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Product name, category and sizing.
                        </p>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        {productFields.map((field) => (

                            <div
                                key={field.name}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        {field.label}
                                    </label>

                                    {field.required && (
                                        <span className="text-xs text-red-500">
                                            Required
                                        </span>
                                    )}

                                </div>

                                {renderField(field)}

                                {field.placeholder && (
                                    <p className="text-xs text-neutral-400">
                                        Example: {field.placeholder}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>

                </div>

                <div className="border-t border-neutral-200" />

                {/* Pricing */}
                <div>
                    <div className="mb-5">

                        <h3 className="text-lg font-semibold">
                            Pricing
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Selling price, retail price and condition.
                        </p>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {pricingFields.map((field) => (
                            <div
                                key={field.name}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        {field.label}
                                    </label>

                                    {field.required && (
                                        <span className="text-xs text-red-500">
                                            Required
                                        </span>
                                    )}

                                </div>

                                {renderField(field)}

                                {field.placeholder && (
                                    <p className="text-xs text-neutral-400">
                                        Example: {field.placeholder}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>

                </div>

                <div className="border-t border-neutral-200" />
                {/* Product Details */}

                <div>

                    <div className="mb-5">

                        <h3 className="text-lg font-semibold">
                            Product Details
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Material, color and additional specifications.
                        </p>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        {detailFields.map((field) => (

                            <div
                                key={field.name}
                                className="space-y-2"
                            >

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        {field.label}
                                    </label>

                                    {field.required && (
                                        <span className="text-xs text-red-500">
                                            Required
                                        </span>
                                    )}

                                </div>

                                {renderField(field)}

                                {field.placeholder && (
                                    <p className="text-xs text-neutral-400">
                                        Example: {field.placeholder}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>

                </div>

                <div className="border-t border-neutral-200" />

                {/* Measurements */}

                <div>

                    <div className="mb-5">

                        <h3 className="text-lg font-semibold">
                            Measurements
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Accurate measurements help buyers purchase with
                            confidence.
                        </p>

                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {measurements.map((item) => (
                            <div
                                key={item.key}
                                className="space-y-2"
                            >

                                <label
                                    htmlFor={item.key}
                                    className="text-sm font-medium"
                                >
                                    {item.label}
                                </label>

                                <input
                                    id={item.key}
                                    name={item.key}
                                    value={form[item.key] ?? ""}
                                    onChange={handleChange}
                                    placeholder={item.placeholder}
                                    className="
                                        h-10
                                        w-full
                                        rounded-xl
                                        border
                                        border-neutral-300
                                        px-4
                                        outline-none
                                        transition
                                        focus:border-black
                                        focus:ring-2
                                        focus:ring-black/5
                                    "
                                />

                            </div>

                        ))}

                    </div>

                </div>

                <div className="border-t border-neutral-200" />

                {/* Description */}

                <div>

                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h3 className="text-lg font-semibold">
                                Description
                            </h3>

                            <p className="mt-1 text-sm text-neutral-500">
                                Write a detailed description to improve trust
                                and conversions.
                            </p>

                        </div>

                        <span className="text-xs text-neutral-500">
                            {descriptionLength} Characters
                        </span>

                    </div>

                    <textarea
                        id="description"
                        rows={6}
                        name="description"
                        value={form.description ?? ""}
                        onChange={handleChange}
                        placeholder="Write a complete product description..."
                        className="
        min-h-[180px]
                      w-full
      resize-none
      rounded-2xl
    border
       border-neutral-300
    bg-white
    p-4
    text-sm
    leading-6
    outline-none
    transition-all
    focus:border-black
    focus:ring-4
    focus:ring-black/5
"
                    />

                </div>

            </div>

        </section>
    );
}