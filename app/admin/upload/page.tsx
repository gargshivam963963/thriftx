"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function AdminUploadPage() {
    const [images, setImages] = useState<File[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        const saved = localStorage.getItem("...");

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

    function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        setImages(Array.from(e.target.files));
        setPrimaryIndex(0);
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

    // if (loading) {
    //     return (
    //         <main className="min-h-screen bg-neutral-100 py-10">
    //             <PageSkeleton
    //                 sidebar
    //                 cards={6}
    //                 cardHeight={180}
    //             />
    //         </main>
    //     );
    // }

    return (
        <main className="min-h-screen bg-neutral-100 py-10">
            <div className="mx-auto max-w-screen-2xl px-4 py-2 sm:px-6 xl:px-8">
                <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Product */}
                        <StickyActionBar
                            isGenerating={isGenerating}
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

                        {/* Images */}
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
                        />
                    </form>

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