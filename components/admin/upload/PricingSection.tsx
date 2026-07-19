"use client";

import { IndianRupee } from "lucide-react";
import { PRODUCT_FIELDS } from "@/lib/productFields";

interface PricingSectionProps {
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

export default function PricingSection({
    form,
    handleChange,
    renderField,
}: PricingSectionProps) {
    const fields = PRODUCT_FIELDS.filter(
        (field) => field.section === "pricing"
    );

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">

                    <IndianRupee
                        size={24}
                        className="text-green-600"
                    />

                </div>

                <div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Pricing
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Enter selling price, retail price and product condition.
                    </p>

                </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {fields.map((field) => (

                    <div
                        key={field.name}
                        className="space-y-2"
                    >

                        <div className="flex items-center justify-between">

                            <label
                                htmlFor={field.name}
                                className="text-sm font-semibold text-neutral-800"
                            >
                                {field.label}
                            </label>

                            {field.required && (
                                <span className="text-xs font-medium text-red-500">
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
        </section>
    );
}