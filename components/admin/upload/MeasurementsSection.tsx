"use client";

import { Ruler } from "lucide-react";

interface MeasurementsSectionProps {
    form: Record<string, string>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
}

const MEASUREMENTS = [
    {
        key: "chest",
        label: "Chest",
        placeholder: '22"',
    },

    {
        key: "waist",
        label: "Waist",
        placeholder: '34"',
    },
    // {
    //     key: "length",
    //     label: "Length",
    //     placeholder: '29"',
    // },
    // {
    //     key: "shoulder",
    //     label: "Shoulder",
    //     placeholder: '19"',
    // },
    // {
    //     key: "sleeve",
    //     label: "Sleeve",
    //     placeholder: '9"',
    // },

    // {
    //     key: "inseam",
    //     label: "Inseam",
    //     placeholder: '30"',
    // },
];

export default function MeasurementsSection({
    form,
    handleChange,
}: MeasurementsSectionProps) {
    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">

                    <Ruler
                        size={24}
                        className="text-orange-600"
                    />

                </div>

                <div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Measurements
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Accurate measurements reduce returns and improve buyer confidence.
                    </p>

                </div>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {MEASUREMENTS.map((item) => (

                    <div
                        key={item.key}
                        className="space-y-2"
                    >

                        <label
                            htmlFor={item.key}
                            className="text-sm font-semibold"
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
                                h-12
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
        </section>
    );
}