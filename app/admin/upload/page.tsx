"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUCT_FIELDS } from "@/lib/productFields";
import {
    Sparkles,
    Upload,
    Save,
    Shirt,
    IndianRupee,
    Package,
    Ruler,
    FileText,
    ImageIcon,
} from "lucide-react";

export default function AdminUploadPage() {
    const [images, setImages] = useState<File[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const initialForm = Object.fromEntries(
        PRODUCT_FIELDS.map((field) => [
            field.name,
            field.defaultValue ?? "",
        ])
    );

    const [form, setForm] = useState<Record<string, string>>(initialForm);

    const AI_FIELDS = PRODUCT_FIELDS.filter(
        (field) => field.ai
    );

    const DEFAULT_AI_FIELDS = AI_FIELDS.map((field) => field.name);

    const [selectedAiFields, setSelectedAiFields] = useState<string[]>(() => {
        if (typeof window === "undefined") return DEFAULT_AI_FIELDS;

        const saved = localStorage.getItem("ai-fields");

        return saved ? JSON.parse(saved) : DEFAULT_AI_FIELDS;
    });

    useEffect(() => {
        localStorage.setItem(
            "ai-fields",
            JSON.stringify(selectedAiFields)
        );
    }, [selectedAiFields]);

    const previews = useMemo(() => {
        return images.map((file) => URL.createObjectURL(file));
    }, [images]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        setImages(Array.from(e.target.files));
    }

    async function handleAIFill() {
        if (!images.length) {
            alert("Please upload at least one image.");
            return;
        }

        try {
            setIsGenerating(true);

            const base64Images = await Promise.all(
                images.map(fileToBase64)
            );

            const response = await fetch("/api/ai/fill", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    images: base64Images,
                    selectedFields: selectedAiFields,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            setForm((prev) => ({
                ...prev,
                ...result.data,
            }));
        } catch (error) {
            console.error(error);

            alert("AI generation failed.");
        } finally {
            setIsGenerating(false);
        }
    }

    async function fileToBase64(file: File) {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result as string;

                resolve(result.split(",")[1]);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        console.log(form);
        console.log(images);
    }

    function renderField(field: typeof PRODUCT_FIELDS[number]) {
        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        rows={4}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-neutral-300 p-4 resize-none outline-none focus:border-black"
                    />
                );

            case "select":
                return (
                    <select
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                    >
                        <option value="">
                            Select {field.label}
                        </option>

                        {field.options?.map((option) => (
                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                    />
                );
        }
    }

    return (
        <main className="min-h-screen bg-neutral-100 py-1{/* Product Information */}0">
            <div className="mx-auto max-w-7xl px-4">
                <div className="rounded-xl border p-5 space-y-4">
                    <h3 className="text-lg font-semibold">
                        AI Fields
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AI_FIELDS.map((field) => (
                            <label
                                key={field.name}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAiFields.includes(field.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedAiFields([
                                                ...selectedAiFields,
                                                field.name,
                                            ]);
                                        } else {
                                            setSelectedAiFields(
                                                selectedAiFields.filter(
                                                    (x) => x !== field.name
                                                )
                                            );
                                        }
                                    }}
                                />

                                {field.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl bg-white p-8 shadow-sm lg:flex-row lg:items-center">

                    <div>
                        <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
                            THRIFTX ADMIN
                        </p>

                        <h1 className="mt-2 text-4xl font-bold tracking-tight">
                            Add Product
                        </h1>

                        <p className="mt-2 max-w-xl text-neutral-500">
                            Upload imported thrift products with pricing,
                            measurements, images and AI assisted details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAIFill}
                        disabled={isGenerating}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <Sparkles size={18} />

                        {isGenerating
                            ? "Generating..."
                            : "AI Fill Details"}
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-neutral-100 p-3">
                                <Shirt size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    Product Information
                                </h2>

                                <p className="text-sm text-neutral-500">
                                    Basic information about your product.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {PRODUCT_FIELDS.filter(
                                (field) => field.section === "product"
                            ).map((field) => (
                                <div key={field.name}>
                                    <label className="mb-2 block text-sm font-medium">
                                        {field.label}
                                    </label>

                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="rounded-xl bg-neutral-100 p-3">
                                <IndianRupee size={22} />
                            </div>

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Pricing
                                </h2>

                                <p className="text-sm text-neutral-500">
                                    Selling price and condition.
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-6 md:grid-cols-3">

                            {PRODUCT_FIELDS.filter(
                                (field) => field.section === "pricing"
                            ).map((field) => (

                                <div key={field.name}>

                                    <label className="mb-2 block text-sm font-medium">
                                        {field.label}
                                    </label>

                                    {renderField(field)}

                                </div>

                            ))}

                        </div>
                    </section>

                    {/* Details */}
                    <section className="rounded-3xl bg-white p-8 shadow-sm">

                        <div className="mb-8 flex items-center gap-3">

                            <div className="rounded-xl bg-neutral-100 p-3">
                                <Package size={22} />
                            </div>

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Product Details
                                </h2>

                                <p className="text-sm text-neutral-500">
                                    Additional information about the product.
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-6 md:grid-cols-2">

                            {PRODUCT_FIELDS.filter(
                                (field) => field.section === "details"
                            ).map((field) => (

                                <div key={field.name}>

                                    <label className="mb-2 block text-sm font-medium">
                                        {field.label}
                                    </label>

                                    {renderField(field)}

                                </div>

                            ))}

                        </div>

                    </section>

                    {/* Measurements */}
                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        {/* Details */}                        <div className="mb-8 flex items-center gap-3">

                            <div className="rounded-xl bg-neutral-100 p-3">
                                <Ruler size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    Measurements
                                </h2>

                                <p className="text-sm text-neutral-500">
                                    Add accurate garment measurements.
                                </p>
                            </div>

                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Chest
                                </label>

                                <input
                                    name="chest"
                                    value={form.chest}
                                    onChange={handleChange}
                                    placeholder='22"'
                                    className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Length
                                </label>

                                <input
                                    name="length"
                                    value={form.length}
                                    onChange={handleChange}
                                    placeholder='29"'
                                    className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Shoulder
                                </label>

                                <input
                                    name="shoulder"
                                    value={form.shoulder}
                                    onChange={handleChange}
                                    placeholder='19"'
                                    className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Sleeve
                                </label>

                                <input
                                    name="sleeve"
                                    value={form.sleeve}
                                    onChange={handleChange}
                                    placeholder='9"'
                                    className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                                />
                            </div>

                        </div>

                    </section>

                    {/* Description */}

                    <section className="rounded-3xl bg-white p-8 shadow-sm">

                        <div className="mb-8 flex items-center gap-3">

                            <div className="rounded-xl bg-neutral-100 p-3">
                                <FileText size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    Description
                                </h2>

                                <p className="text-sm text-neutral-500">
                                    Write a detailed product description.
                                </p>
                            </div>

                        </div>

                        <div className="space-y-6">

                            <div>

                                <label className="mb-2 block text-sm font-medium">
                                    Product Description
                                </label>

                                <textarea
                                    rows={6}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the product..."
                                    className="w-full rounded-xl border border-neutral-300 p-4 outline-none resize-none focus:border-black"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium">
                                    Shipping Information
                                </label>

                                <textarea
                                    rows={3}
                                    name="shipping"
                                    value={form.shipping}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-neutral-300 p-4 outline-none resize-none focus:border-black"
                                />

                            </div>

                        </div>

                    </section>

                    {/* Images */}

                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                    </section>

                    <div className="mb-8 flex items-center gap-3">

                        <div className="rounded-xl bg-neutral-100 p-3">
                            <ImageIcon size={22} />
                        </div>

                        <div>

                            <h2 className="text-xl font-semibold">
                                Product Images
                            </h2>

                            <p className="text-sm text-neutral-500">
                                Upload multiple high-quality images.
                            </p>

                        </div>

                    </div>

                    <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 transition hover:border-black hover:bg-neutral-50">
                        <Upload
                            size={40}
                            className="mb-4 text-neutral-500"
                        />

                        <h3 className="text-lg font-semibold">
                            Click to Upload
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            PNG, JPG or WEBP
                        </p>

                        <input
                            hidden
                            multiple
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                    </label>

                    {previews.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                            {previews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border bg-neutral-100"
                                >
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="aspect-square h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}

                    <section className="rounded-3xl bg-white p-8 shadow-sm">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                                <h3 className="text-xl font-semibold">
                                    Ready to Publish?
                                </h3>

                                <p className="mt-2 max-w-lg text-neutral-500">
                                    Double-check the product information before
                                    saving. Images and AI integration will be
                                    connected in the next step.
                                </p>

                            </div>

                            <div className="flex flex-wrap gap-4">

                                <button
                                    type="button"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 px-6 font-medium transition hover:bg-neutral-100"
                                >
                                    <Sparkles size={18} />
                                    AI Fill Details
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-8 font-medium text-white transition hover:bg-neutral-800"
                                >
                                    <Save size={18} />
                                    Save Product
                                </button>

                            </div>

                        </div>

                    </section>

                </form>

            </div>

            {/* Mobile Sticky Action Bar */}

            <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/90 backdrop-blur lg:hidden">

                <div className="mx-auto flex max-w-7xl gap-3 p-4">

                    <button
                        type="button"
                        className="flex-1 rounded-xl border border-neutral-300 py-3 font-medium"
                    >
                        AI Fill
                    </button>

                    <button
                        type="submit"
                        onClick={() =>
                            document
                                .querySelector("form")
                                ?.requestSubmit()
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 font-medium text-white"
                    >
                        <Save size={18} />
                        Save
                    </button>

                </div>

            </div>

        </main>
    );
}