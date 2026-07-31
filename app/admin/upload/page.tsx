"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCT_FIELDS } from "@/lib/productFields";
import { Save, Sparkles } from "lucide-react";
import UploadDropzone from "@/components/admin/upload/UploadDropzone";
import ImagePreviewGrid from "@/components/admin/upload/ImagePreviewGrid";
import ProductSection from "@/components/admin/upload/ProductSection";
import PricingSection from "@/components/admin/upload/PricingSection";
import DetailsSection from "@/components/admin/upload/DetailsSection";
import MeasurementsSection from "@/components/admin/upload/MeasurementsSection";
import DescriptionSection from "@/components/admin/upload/DescriptionSection";
import AIDrawer from "@/components/admin/upload/AIDrawer";
import StickyActionBar from "@/components/admin/upload/StickyActionBar";
import PageSkeleton from "@/components/ui/PageSkeleton";
import ProductInformation from "@/components/admin/upload/ProductInformation";
import { uploadProduct } from "@/lib/services/uploadProduct";

const UPPER_CATEGORIES = [
    "T-Shirts",
    "Shirts",
    "Hoodies",
    "Sweatshirts",
    "Jackets",
    "Blazers",
    "Tops",
];

const LOWER_CATEGORIES = [
    "Jeans",
    "Cargo",
    "Trousers",
    "Shorts",
    "Skirts",
    "Lower",
];

function getMeasurementsForCategory(category: string) {
    const cat = category?.trim();

    if (UPPER_CATEGORIES.includes(cat)) {
        return [
            { key: "chest", label: "Chest", placeholder: '22"' },
            { key: "length", label: "Length", placeholder: '29"' },
        ];
    }

    if (LOWER_CATEGORIES.includes(cat)) {
        return [
            { key: "waist", label: "Waist", placeholder: '34"' },
            { key: "length", label: "Length", placeholder: '42"' },
        ];
    }

    if (cat === "Dresses") {
        return [
            { key: "chest", label: "Chest", placeholder: '22"' },
            { key: "waist", label: "Waist", placeholder: '34"' },
            { key: "length", label: "Length", placeholder: '42"' },
        ];
    }

    return [
        { key: "chest", label: "Chest", placeholder: '22"' },
        { key: "waist", label: "Waist", placeholder: '34"' },
    ];
}

export default function AdminUploadPage() {
    const [images, setImages] = useState<File[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [autoAiTriggered, setAutoAiTriggered] = useState(false);
    const aiTriggeredRef = useRef(false);

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

    const [selectedAiFields, setSelectedAiFields] =
        useState<string[]>(DEFAULT_AI_FIELDS);

    const measurements = useMemo(
        () => getMeasurementsForCategory(form.category),
        [form.category]
    );

    useEffect(() => {
        const saved = localStorage.getItem("ai-fields");

        if (!saved) return;

        queueMicrotask(() => {
            try {
                setSelectedAiFields(JSON.parse(saved));
            } catch {
                // ignore invalid data
            }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "ai-fields",
            JSON.stringify(selectedAiFields)
        );
    }, [selectedAiFields]);

    const previews = useMemo(
        () => images.map((file) => URL.createObjectURL(file)),
        [images]
    );

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

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

    function handleMeasurementChange(key: string, value: string) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        setImages(files);
        setPrimaryIndex(0);
        setAutoAiTriggered(false);
        aiTriggeredRef.current = false;

        // Auto-trigger AI fill with a small delay after images are selected
        setTimeout(() => {
            if (!aiTriggeredRef.current) {
                aiTriggeredRef.current = true;
                setAutoAiTriggered(true);
                // Trigger AI fill
                handleAIFillWithFiles(files);
            }
        }, 500);
    }

    // Maps AI response keys (e.g. seoTitle, seoDescription) to form field names
    const AI_TO_FORM_MAP: Record<string, string> = {
        seoTitle: "title",
        seoDescription: "description",
        brand: "brand",
        gender: "gender",
        category: "category",
        size: "size",
        color: "color",
        material: "material",
        condition: "condition",
        chest: "chest",
        waist: "waist",
        length: "length",
        productType: "",
    };

    function extractAiData(data: Record<string, unknown>): Record<string, string> {
        const flatData: Record<string, string> = {};
        for (const [key, field] of Object.entries(data)) {
            const extracted = field as { value?: string | null };
            if (extracted?.value) {
                const formKey = AI_TO_FORM_MAP[key] || key;
                if (formKey) {
                    flatData[formKey] = extracted.value;
                }
            }
        }
        return flatData;
    }

    async function handleAIFillWithFiles(files: File[]) {
        if (!files.length) return;

        try {
            setIsGenerating(true);

            const base64Images = await Promise.all(
                files.map(fileToBase64)
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
                console.warn("Auto AI fill:", result.message);
                return;
            }

            const flatData = extractAiData(result.data);
            if (Object.keys(flatData).length > 0) {
                setForm((prev) => ({
                    ...prev,
                    ...flatData,
                }));
            }
        } catch (error) {
            console.error("Auto AI fill failed:", error);
        } finally {
            setIsGenerating(false);
        }
    }

    function handleRemoveImage(index: number) {
        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        if (primaryIndex >= index && primaryIndex > 0) {
            setPrimaryIndex((prev) => prev - 1);
        }
    }

    function handlePrimaryImage(index: number) {
        setPrimaryIndex(index);
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

            const flatData = extractAiData(result.data);
            if (Object.keys(flatData).length > 0) {
                setForm((prev) => ({
                    ...prev,
                    ...flatData,
                }));
            }

            alert("AI generated fields filled successfully!");
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

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            setIsSaving(true);

            await uploadProduct({
                form,
                images,
                primaryIndex,
            });

            alert("Product uploaded successfully!");

            setImages([]);
            setPrimaryIndex(0);
            setForm(initialForm);
            setAutoAiTriggered(false);
            aiTriggeredRef.current = false;
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert(JSON.stringify(error));
            }
        } finally {
            setIsSaving(false);
        }
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
                        className="h-11 w-full rounded-xl border border-neutral-300 p-4 resize-none outline-none focus:border-black"
                    />
                );

            case "select":
                return (
                    <select
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
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
                        className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
                    />
                );
        }
    }

    return (
        <main className="min-h-screen bg-neutral-100 py-10">
            <div className="mx-auto max-w-screen-2xl px-4 py-2 sm:px-6 xl:px-8">
                <div className="grid gap-5 xl:grid-cols-[1fr_1fr_320px]">
                    {/* Left Column: Product Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <StickyActionBar
                            isGenerating={isGenerating}
                            isSaving={isSaving}
                            onGenerate={handleAIFill}
                            onSubmit={() =>
                                document
                                    .querySelector("form")
                                    ?.requestSubmit()
                            }
                        />

                        <ProductInformation
                            form={form}
                            handleChange={handleChange}
                            renderField={renderField}
                        />

                        <div className="mt-5 flex flex-wrap gap-3">
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2">
                                <p className="text-xs text-neutral-500">
                                    Uploaded
                                </p>
                                <p className="text-lg font-semibold">
                                    {images.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2">
                                <p className="text-xs text-neutral-500">
                                    AI Fields
                                </p>
                                <p className="text-lg font-semibold">
                                    {selectedAiFields.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2">
                                <p className="text-xs text-neutral-500">
                                    Status
                                </p>
                                <p className="text-lg font-semibold text-emerald-600">
                                    Ready
                                </p>
                            </div>
                        </div>
                    </form>

                    {/* Center Column: Images + Preview Grid with Measurements */}
                    <div className="space-y-5">
                        <UploadDropzone
                            images={images}
                            previews={previews}
                            isGenerating={isGenerating}
                            onImageChange={handleImageChange}
                            onAIFill={handleAIFill}
                        />

                        <ImagePreviewGrid
                            previews={previews}
                            onRemove={handleRemoveImage}
                            primaryIndex={primaryIndex}
                            onPrimary={handlePrimaryImage}
                            measurements={measurements}
                            form={form}
                            onMeasurementChange={handleMeasurementChange}
                        />
                    </div>

                    {/* Right Column: AI Assistant */}
                    <AIDrawer
                        isGenerating={isGenerating}
                        selectedAiFields={selectedAiFields}
                        setSelectedAiFields={setSelectedAiFields}
                        onGenerate={handleAIFill}
                    />
                </div>
            </div>
        </main >
    );
}
