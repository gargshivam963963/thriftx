"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ImagePlus, Trash2, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PRODUCT_FIELDS } from "@/lib/productFields";

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

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ProductFormData, images: File[], primaryIndex: number) => void;
    saving: boolean;
    editProduct?: {
        id: string;
        data: ProductFormData;
        images: string[];
    } | null;
}

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
    shippingInfo: "Ships within 24 hours. Pan India delivery in 3–7 business days.",
};

export default function ProductFormModal({
    open,
    onClose,
    onSave,
    saving,
    editProduct,
}: ProductFormModalProps) {
    const [form, setForm] = useState<ProductFormData>(defaultForm);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [primaryIndex, setPrimaryIndex] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isEditing = !!editProduct;

    useEffect(() => {
        if (open) {
            if (editProduct) {
                setForm(editProduct.data);
                setPreviews(editProduct.images);
                setNewImages([]);
                setPrimaryIndex(0);
            } else {
                setForm(defaultForm);
                setNewImages([]);
                setPreviews([]);
                setPrimaryIndex(0);
            }
            setErrors({});
            // Scroll to top
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
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

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setNewImages((prev) => [...prev, ...files]);
        setPreviews((prev) => [...prev, ...newPreviews]);
    }

    function removeImage(index: number) {
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        if (primaryIndex === index) setPrimaryIndex(0);
        else if (primaryIndex > index) setPrimaryIndex((p) => p - 1);
    }

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!form.title.trim()) errs.title = "Title is required";
        if (!form.brand.trim()) errs.brand = "Brand is required";
        if (!form.category) errs.category = "Category is required";
        if (!form.size.trim()) errs.size = "Size is required";
        if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
            errs.price = "Valid price is required";
        if (!form.material.trim()) errs.material = "Material is required";
        if (!isEditing && newImages.length === 0 && previews.length === 0)
            errs.images = "At least one image is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        onSave(form, newImages, primaryIndex);
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: "spring", damping: 25, stiffness: 280 }}
                        className="fixed inset-x-4 bottom-4 top-4 z-50 mx-auto max-w-2xl"
                    >
                        <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {isEditing ? "Edit Product" : "Add Product"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
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

                                {/* Measurements */}
                                <div>
                                    <h3 className="mb-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                        Measurements
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {PRODUCT_FIELDS.filter((f) => f.section === "measurements").map((field) => (
                                            <div key={field.name} className="space-y-1">
                                                <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    value={form[field.name]}
                                                    onChange={handleChange}
                                                    placeholder={field.placeholder}
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

                                <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                                {/* Images */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Images</h3>
                                            <p className="text-[10px] text-neutral-400">First image is the cover</p>
                                        </div>
                                        {errors.images && (
                                            <p className="text-[10px] font-medium text-red-500">{errors.images}</p>
                                        )}
                                    </div>

                                    {/* Dropzone */}
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-4 transition hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-400 dark:hover:bg-neutral-800/50">
                                        <Upload size={16} className="text-neutral-400" />
                                        <span className="text-xs font-medium text-neutral-500">Add images</span>
                                        <input
                                            ref={fileRef}
                                            hidden
                                            multiple
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </label>

                                    {/* Previews */}
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                            {previews.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700"
                                                >
                                                    <Image
                                                        src={src}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryIndex(i)}
                                                        className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold transition ${primaryIndex === i
                                                                ? "bg-amber-400 text-amber-900"
                                                                : "bg-white/80 text-neutral-500 opacity-0 group-hover:opacity-100"
                                                            }`}
                                                    >
                                                        <Star size={10} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-white/80 text-red-500 opacity-0 transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                    {primaryIndex === i && (
                                                        <span className="absolute bottom-1 left-1 rounded-md bg-amber-400/90 px-1.5 py-0.5 text-[8px] font-bold text-amber-900">
                                                            Cover
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                </>
            )}
        </AnimatePresence>
    );
}

