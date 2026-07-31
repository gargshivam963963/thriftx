"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ImagePlus,
    Star,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Wand2,
    CheckCircle2,
    RotateCcw,
    Check,
} from "lucide-react";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_FIELDS } from "@/lib/productFields";
import { deleteImageFromStorage } from "@/lib/services/storage";
import SortableImage from "@/components/SortableImage";

export interface ProductFormData {
    title: string;
    brand: string;
    gender: string;
    category: string;
    size: string;
    price: string;
    retailPrice: string;
    condition: string;
    color: string;
    material: string;
    chest: string;
    waist: string;
    length: string;
    inseam: string;
    description: string;
    shippingInfo: string;
    [key: string]: string;
}

export interface ImageItem {
    id: string;
    url: string;
    file?: File;
    isExisting: boolean;
}

interface MeasurementField {
    key: string;
    label: string;
    placeholder: string;
}

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ProductFormData, orderedImageUrls: string[], filesToUpload: File[]) => void;
    saving: boolean;
    editProduct?: {
        id: string;
        data: ProductFormData;
        images: string[];
    } | null;
}

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

function getMeasurementsForCategory(category: string): MeasurementField[] {
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

const AI_FEATURES = [
    "Brand Detection",
    "Product Description",
    "Category Prediction",
    "Material & Color",
    "Measurement Extraction",
];

const AI_FIELD_NAMES = PRODUCT_FIELDS.filter((f) => f.ai).map((f) => f.name);

const defaultForm: ProductFormData = {
    title: "",
    brand: "",
    gender: "Unisex",
    category: "",
    size: "",
    price: "",
    retailPrice: "",
    condition: "Excellent",
    color: "",
    material: "",
    chest: "",
    waist: "",
    length: "",
    inseam: "",
    description: "",
    shippingInfo: "Ships within 24 hours. Pan India delivery in 3\u20137 business days.",
};

let _imageIdCounter = 0;
function generateImageId(): string {
    _imageIdCounter += 1;
    return `img_${Date.now()}_${_imageIdCounter}`;
}

export default function ProductFormModal({
    open,
    onClose,
    onSave,
    saving,
    editProduct,
}: ProductFormModalProps) {
    const [form, setForm] = useState<ProductFormData>(defaultForm);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAiFields, setSelectedAiFields] = useState<string[]>(AI_FIELD_NAMES);
    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const aiTriggeredRef = useRef(false);

    const isEditing = !!editProduct;

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    });
    const sensors = useSensors(pointerSensor);

    const measurements = useMemo(
        () => getMeasurementsForCategory(form.category),
        [form.category]
    );

    // Reset state on open/close
    useEffect(() => {
        if (open) {
            if (editProduct) {
                setForm(editProduct.data);
                setImages(
                    editProduct.images.map((url) => ({
                        id: generateImageId(),
                        url,
                        isExisting: true,
                    }))
                );
            } else {
                setForm(defaultForm);
                setImages([]);
            }
            setErrors({});
            setPreviewIndex(null);
            aiTriggeredRef.current = false;
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
        } else {
            aiTriggeredRef.current = false;
            setImages((prev) => {
                prev.forEach((img) => {
                    if (!img.isExisting && img.url.startsWith("blob:")) {
                        URL.revokeObjectURL(img.url);
                    }
                });
                return [];
            });
        }
    }, [open, editProduct]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    }

    function handleMeasurementFieldChange(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    // ── Image Management ──

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newItems: ImageItem[] = files.map((f) => ({
            id: generateImageId(),
            url: URL.createObjectURL(f),
            file: f,
            isExisting: false,
        }));

        setImages((prev) => [...prev, ...newItems]);
        if (fileRef.current) fileRef.current.value = "";

        // Auto-trigger AI fill when images are added (only for new products)
        if (!isEditing && !aiTriggeredRef.current) {
            aiTriggeredRef.current = true;
            setTimeout(() => {
                handleAIFillWithFiles([...images, ...newItems].filter((img) => img.file).map((img) => img.file!));
            }, 500);
        }
    }

    async function removeImage(index: number) {
        const target = images[index];
        if (!target) return;

        if (target.isExisting) {
            setIsDeletingImage(true);
            try {
                await deleteImageFromStorage(target.url);
            } catch (err) {
                console.error("Failed to delete image from storage:", err);
            } finally {
                setIsDeletingImage(false);
            }
        } else {
            if (target.url.startsWith("blob:")) {
                URL.revokeObjectURL(target.url);
            }
        }

        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setImages((prev) => {
            const oldIndex = prev.findIndex((img) => img.id === active.id);
            const newIndex = prev.findIndex((img) => img.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    // ── AI Fill ──

    async function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /** Maps AI response keys to form field names */
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
        inseam: "inseam",
        productType: "", // Not used in form directly
    };

    function extractAiData(data: Record<string, unknown>): Record<string, string> {
        const flatData: Record<string, string> = {};
        for (const [key, field] of Object.entries(data)) {
            const extracted = field as { value?: string | null };
            if (extracted?.value) {
                // Map AI key to form field name
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
            const base64Images = await Promise.all(files.map(fileToBase64));

            const response = await fetch("/api/ai/fill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                setForm((prev) => ({ ...prev, ...flatData }));
            }
        } catch (error) {
            console.error("Auto AI fill failed:", error);
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleAIFill() {
        const allFiles = images.filter((img) => img.file).map((img) => img.file!);
        if (!allFiles.length) {
            if (isEditing) {
                alert("For AI fill, please re-upload the images you want to analyze.");
                return;
            }
            alert("Please upload at least one image first.");
            return;
        }

        try {
            setIsGenerating(true);
            const base64Images = await Promise.all(allFiles.map(fileToBase64));

            const response = await fetch("/api/ai/fill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    images: base64Images,
                    selectedFields: selectedAiFields,
                }),
            });

            const result = await response.json();
            if (!result.success) {
                alert(result.message || "AI generation failed.");
                return;
            }

            const flatData = extractAiData(result.data);
            if (Object.keys(flatData).length > 0) {
                setForm((prev) => ({ ...prev, ...flatData }));
            }
        } catch (error) {
            console.error("AI fill failed:", error);
            alert("AI generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    // ── Preview Modal ──

    function openPreview(index: number) {
        setPreviewIndex(index);
    }

    function closePreview() {
        setPreviewIndex(null);
    }

    function prevPreview() {
        setPreviewIndex((prev) =>
            prev !== null ? (prev - 1 + images.length) % images.length : null
        );
    }

    function nextPreview() {
        setPreviewIndex((prev) =>
            prev !== null ? (prev + 1) % images.length : null
        );
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (previewIndex === null) return;
            if (e.key === "Escape") closePreview();
            if (e.key === "ArrowLeft") prevPreview();
            if (e.key === "ArrowRight") nextPreview();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewIndex, images.length]);

    // ── AI Field Selector ──

    function toggleAiField(name: string) {
        setSelectedAiFields((prev) =>
            prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
        );
    }

    function selectAllAiFields() {
        setSelectedAiFields(AI_FIELD_NAMES);
    }

    function clearAiFields() {
        setSelectedAiFields([]);
    }

    // ── Validation & Submit ──

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!form.title.trim()) errs.title = "Title is required";
        if (!form.brand.trim()) errs.brand = "Brand is required";
        if (!form.category) errs.category = "Category is required";
        if (!form.size.trim()) errs.size = "Size is required";
        if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
            errs.price = "Valid price is required";
        if (!form.material.trim()) errs.material = "Material is required";
        if (!isEditing && images.length === 0)
            errs.images = "At least one image is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        const orderedImageUrls = images.map((img) => img.url);
        const filesToUpload = images
            .filter((img) => img.file)
            .map((img) => img.file!);
        onSave(form, orderedImageUrls, filesToUpload);
    }

    // ── Render ──

    const aiFieldsList = PRODUCT_FIELDS.filter((f) => f.ai);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: "spring", damping: 25, stiffness: 280 }}
                        className="fixed inset-x-4 bottom-4 top-4 z-50 mx-auto max-w-6xl"
                    >
                        <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        {isEditing ? "Edit Product" : "Add Product"}
                                    </h2>
                                    {isGenerating && (
                                        <span className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                                            AI Generating...
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* 3-Column Body */}
                            <div className="flex-1 overflow-hidden">
                                <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[1fr_1fr_280px]">
                                    {/* ── LEFT COLUMN: Product Form ── */}
                                    <div
                                        ref={scrollRef}
                                        className="overflow-y-auto border-r border-neutral-100 px-5 py-4 dark:border-neutral-800 space-y-5"
                                    >
                                        {/* Basic Fields */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {PRODUCT_FIELDS.filter((f) => f.section === "product").map((field) => (
                                                <div key={field.name} className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                        {field.label}
                                                        {field.required && <span className="ml-0.5 text-red-500">*</span>}
                                                    </label>
                                                    {field.type === "select" ? (
                                                        <select
                                                            name={field.name}
                                                            value={form[field.name]}
                                                            onChange={handleChange}
                                                            className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:text-neutral-200 ${errors[field.name]
                                                                ? "border-red-400 focus:border-red-500"
                                                                : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-600"
                                                                }`}
                                                        >
                                                            <option value="">Select</option>
                                                            {(field.options || []).map((opt) => (
                                                                <option key={opt} value={opt}>
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            name={field.name}
                                                            value={form[field.name]}
                                                            onChange={handleChange}
                                                            placeholder={field.placeholder}
                                                            className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:text-neutral-200 ${errors[field.name]
                                                                ? "border-red-400 focus:border-red-500"
                                                                : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-600"
                                                                }`}
                                                        />
                                                    )}
                                                    {errors[field.name] && (
                                                        <p className="text-[10px] font-medium text-red-500">{errors[field.name]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                        {/* Pricing */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            {PRODUCT_FIELDS.filter((f) => f.section === "pricing").map((field) => (
                                                <div key={field.name} className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                        {field.label}
                                                        {field.required && <span className="ml-0.5 text-red-500">*</span>}
                                                    </label>
                                                    {field.type === "select" ? (
                                                        <select
                                                            name={field.name}
                                                            value={form[field.name]}
                                                            onChange={handleChange}
                                                            className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:text-neutral-200 ${errors[field.name]
                                                                ? "border-red-400"
                                                                : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-600"
                                                                }`}
                                                        >
                                                            {(field.options || []).map((opt) => (
                                                                <option key={opt} value={opt}>
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            name={field.name}
                                                            value={form[field.name]}
                                                            onChange={handleChange}
                                                            placeholder={field.placeholder}
                                                            className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:text-neutral-200 ${errors[field.name]
                                                                ? "border-red-400"
                                                                : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-600"
                                                                }`}
                                                        />
                                                    )}
                                                    {errors[field.name] && (
                                                        <p className="text-[10px] font-medium text-red-500">{errors[field.name]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                        {/* Details */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {PRODUCT_FIELDS.filter((f) => f.section === "details").map((field) => (
                                                <div key={field.name} className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                        {field.label}
                                                        {field.required && <span className="ml-0.5 text-red-500">*</span>}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={form[field.name]}
                                                        onChange={handleChange}
                                                        placeholder={field.placeholder}
                                                        className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-neutral-900/10 dark:bg-neutral-800 dark:text-neutral-200 ${errors[field.name]
                                                            ? "border-red-400"
                                                            : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-600"
                                                            }`}
                                                    />
                                                    {errors[field.name] && (
                                                        <p className="text-[10px] font-medium text-red-500">{errors[field.name]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                        {/* Measurements (conditional) */}
                                        <div>
                                            <h3 className="mb-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                Measurements
                                                {form.category && (
                                                    <span className="ml-2 text-[10px] font-normal text-neutral-400">
                                                        ({form.category === "Dresses" ? "Chest + Waist + Length" :
                                                            UPPER_CATEGORIES.includes(form.category) ? "Chest + Length" :
                                                                LOWER_CATEGORIES.includes(form.category) ? "Waist + Length" :
                                                                    "Chest + Waist"})
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {measurements.map((m) => (
                                                    <div key={m.key} className="space-y-1">
                                                        <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                                            {m.label}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name={m.key}
                                                            value={form[m.key] ?? ""}
                                                            onChange={(e) => handleMeasurementFieldChange(m.key, e.target.value)}
                                                            placeholder={m.placeholder}
                                                            className="h-9 w-full rounded-lg border border-neutral-300 px-3 text-xs outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={form.description}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Write a complete product description..."
                                                className="w-full resize-none rounded-xl border border-neutral-300 p-3.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                            />
                                            <div className="flex justify-end">
                                                <span className="text-[10px] text-neutral-400">{form.description.length} chars</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── CENTER COLUMN: Images + Preview Grid with Measurements ── */}
                                    <div className="overflow-y-auto px-5 py-4 space-y-5 border-r border-neutral-100 dark:border-neutral-800">
                                        {/* Images Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                        Images
                                                    </h3>
                                                    {images.length > 0 && (
                                                        <Badge variant="secondary" size="xs" rounded="md">
                                                            {images.length} {images.length === 1 ? "image" : "images"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {images.length > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-neutral-400">
                                                            Drag to reorder
                                                        </span>
                                                        <Star size={12} className="text-amber-500" />
                                                    </div>
                                                )}
                                            </div>

                                            {errors.images && (
                                                <p className="text-[10px] font-medium text-red-500">{errors.images}</p>
                                            )}

                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={images.map((img) => img.id)}
                                                    strategy={rectSortingStrategy}
                                                >
                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                        {images.map((img, index) => (
                                                            <div key={img.id} className="space-y-2">
                                                                <SortableImage
                                                                    id={img.id}
                                                                    src={img.url}
                                                                    index={index}
                                                                    isCover={index === 0}
                                                                    onDelete={() => removeImage(index)}
                                                                    onPreview={() => openPreview(index)}
                                                                />
                                                                {/* Measurement fields below each card */}
                                                                {measurements.length > 0 && (
                                                                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 space-y-1.5 dark:border-neutral-700 dark:bg-neutral-800/50">
                                                                        {measurements.map((m) => (
                                                                            <div key={m.key} className="flex items-center gap-1.5">
                                                                                <label className="text-[10px] font-semibold text-neutral-500 w-12 shrink-0">
                                                                                    {m.label}
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={form[m.key] ?? ""}
                                                                                    onChange={(e) => handleMeasurementFieldChange(m.key, e.target.value)}
                                                                                    placeholder={m.placeholder}
                                                                                    className="h-7 w-full rounded-md border border-neutral-300 bg-white px-2 text-[10px] text-center outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Upload button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => fileRef.current?.click()}
                                                            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800/50 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                                                        >
                                                            <ImagePlus size={22} className="text-neutral-400" />
                                                            <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                                                                {images.length === 0 ? "Add Images" : "Add More"}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </SortableContext>
                                            </DndContext>

                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />

                                            <p className="text-[10px] text-neutral-400 leading-relaxed">
                                                Supported formats: JPEG, PNG, WebP. First image is automatically set as the
                                                product cover. Drag to reorder.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    loading={saving}
                                    loadingText="Saving..."
                                >
                                    {isEditing ? "Update Product" : "Add Product"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Full-Screen Image Preview Modal ── */}
                    <AnimatePresence>
                        {previewIndex !== null && images[previewIndex] && (
                            <>
                                <motion.div
                                    key="preview-backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={closePreview}
                                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                                />
                                <motion.div
                                    key="preview-content"
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="fixed inset-0 z-[60] flex items-center justify-center"
                                >
                                    <button
                                        onClick={closePreview}
                                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                        {previewIndex + 1} / {images.length}
                                    </div>
                                    {images.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevPreview(); }}
                                            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>
                                    )}
                                    <div
                                        className="relative flex h-full w-full items-center justify-center p-4 sm:p-8"
                                        onClick={closePreview}
                                    >
                                        <motion.div
                                            key={previewIndex}
                                            initial={{ opacity: 0, x: 40 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -40 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative h-full w-full max-h-[85vh] max-w-[90vw]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Image
                                                src={images[previewIndex].url}
                                                alt={`Product image ${previewIndex + 1}`}
                                                fill
                                                unoptimized
                                                className="object-contain"
                                                sizes="90vw"
                                            />
                                        </motion.div>
                                    </div>
                                    {images.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextPreview(); }}
                                            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                        >
                                            <ChevronRight size={22} />
                                        </button>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
