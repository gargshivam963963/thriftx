"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Package,
    RefreshCw,
    Grid3X3,
    List,
    Plus,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadImageToR2 } from "@/lib/services/r2Upload";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/admin/toast/Toast";
import ToastContainer from "@/components/admin/toast/Toast";
import ProductFormModal, { type ProductFormData } from "@/components/admin/products/ProductFormModal";
import ConfirmDialog from "@/components/admin/products/ConfirmDialog";
import ProductSkeleton from "@/components/admin/products/ProductSkeleton";

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

// ── Admin product API helpers (server route proxies) ──
async function apiGetProducts(): Promise<AdminProduct[]> {
    const res = await fetch("/api/admin/products");
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.products) ? json.products : [];
}

async function apiToggleStatus(id: string, isActive: boolean): Promise<boolean> {
    const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
    });
    const json = await res.json();
    return json?.success === true;
}

async function apiDeleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    const json = await res.json();
    return json?.success === true;
}

async function apiCreateProduct(data: Record<string, unknown>): Promise<string> {
    const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || json?.success !== true || typeof json.productId !== "string") {
        throw new Error(json?.message || "Failed to create product draft");
    }
    return json.productId;
}

async function apiUpdateProduct(id: string, data: Record<string, unknown>): Promise<void> {
    const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data }),
    });
    const json = await res.json();
    if (!res.ok || json?.success !== true) {
        throw new Error(json?.message || "Failed to save product");
    }
}

interface AdminProduct {
    $id: string;
    $createdAt: string;

    title: string;
    brand: string;
    category: string;
    gender: string;

    price: number;
    retailPrice?: number;

    condition: string;

    size: string;

    chest?: string;
    waist?: string;
    length?: string;
    inseam?: string;

    color: string;
    material: string;

    description: string;
    shippingInfo?: string;

    primaryImage: string;
    images: string[];
    imageKeys: string[];

    status: string;
    isActive: boolean;
}

// ── Measurement helpers ──
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

function getMeasurementLabel(category: string): string | null {
    const cat = category?.trim();
    if (UPPER_CATEGORIES.includes(cat)) return "Chest / Length";
    if (LOWER_CATEGORIES.includes(cat)) return "Waist / Length";
    if (cat === "Dresses") return "Chest / Waist / Length";
    return "Chest / Waist";
}

function getMeasurementValues(product: AdminProduct): { label: string; value: string }[] | null {
    const cat = product.category?.trim();
    if (UPPER_CATEGORIES.includes(cat)) {
        const parts: { label: string; value: string }[] = [];
        if (product.chest) parts.push({ label: "Chest", value: product.chest });
        if (product.length) parts.push({ label: "Length", value: product.length });
        return parts.length > 0 ? parts : null;
    }
    if (LOWER_CATEGORIES.includes(cat)) {
        const parts: { label: string; value: string }[] = [];
        if (product.waist) parts.push({ label: "Waist", value: product.waist });
        if (product.length) parts.push({ label: "Length", value: product.length });
        return parts.length > 0 ? parts : null;
    }
    if (cat === "Dresses") {
        const parts: { label: string; value: string }[] = [];
        if (product.chest) parts.push({ label: "Chest", value: product.chest });
        if (product.waist) parts.push({ label: "Waist", value: product.waist });
        if (product.length) parts.push({ label: "Length", value: product.length });
        return parts.length > 0 ? parts : null;
    }
    // Default
    const parts: { label: string; value: string }[] = [];
    if (product.chest) parts.push({ label: "Chest", value: product.chest });
    if (product.waist) parts.push({ label: "Waist", value: product.waist });
    return parts.length > 0 ? parts : null;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Modal state
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editProduct, setEditProduct] = useState<{
        id: string;
        data: ProductFormData;
        images: string[];
        imageKeys: string[];
    } | null>(null);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Image preview
    const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);
    const [previewIndex, setPreviewIndex] = useState(0);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error loading products:", err);
            setError("Failed to load products. Please try again.");
            showToast({ type: "error", title: "Failed to load products" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const categories = useMemo(() => {
        const cats = new Set(products.map((p) => p.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (categoryFilter !== "all") {
            result = result.filter((p) => p.category === categoryFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.brand.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }
        return result;
    }, [products, search, categoryFilter]);

    const activeCount = products.filter((p) => p.isActive).length;
    const draftCount = products.filter((p) => p.status === "draft").length;

    // ── Handlers ──

    const handleToggleStatus = async (productId: string, currentActive: boolean) => {
        setUpdatingId(productId);
        try {
            const success = await apiToggleStatus(productId, !currentActive);
            if (success) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p.$id === productId ? { ...p, isActive: !currentActive } : p
                    )
                );
                showToast({
                    type: "success",
                    title: currentActive ? "Product deactivated" : "Product activated",
                });
            } else {
                showToast({ type: "error", title: "Failed to update status" });
            }
        } catch {
            showToast({ type: "error", title: "Failed to update status" });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const success = await apiDeleteProduct(deleteTarget.id);
            if (success) {
                setProducts((prev) => prev.filter((p) => p.$id !== deleteTarget.id));
                showToast({ type: "success", title: "Product deleted", message: deleteTarget.title });
            } else {
                showToast({ type: "error", title: "Failed to delete product" });
            }
        } catch {
            showToast({ type: "error", title: "Failed to delete product" });
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const openAddModal = () => {
        setEditProduct(null);
        setFormOpen(true);
    };

    const openEditModal = (product: AdminProduct) => {
        const formData: ProductFormData = {
            title: product.title || "",
            brand: product.brand || "",
            gender: product.gender || "Unisex",
            category: product.category || "",
            size: product.size || "",
            price: String(product.price || ""),
            retailPrice: product.retailPrice ? String(product.retailPrice) : "",
            condition: product.condition || "Excellent",
            color: product.color || "",
            material: product.material || "",

            chest: product.chest || "",
            waist: product.waist || "",
            length: product.length || "",
            inseam: product.inseam || "",

            description: product.description || "",
            shippingInfo: product.shippingInfo || "",
        };

        setEditProduct({
            id: product.$id,
            data: formData,
            images: product.images || (product.primaryImage ? [product.primaryImage] : []),
            imageKeys: product.imageKeys || [],
        });

        setFormOpen(true);
    };

    // ── Image Preview Navigation ──
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!previewProduct) return;
            const allImages = previewProduct.images?.length
                ? previewProduct.images
                : previewProduct.primaryImage
                    ? [previewProduct.primaryImage]
                    : [];
            if (e.key === "Escape") {
                setPreviewProduct(null);
                setPreviewIndex(0);
            }
            if (e.key === "ArrowLeft") {
                setPreviewIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
            }
            if (e.key === "ArrowRight") {
                setPreviewIndex((prev) => (prev + 1) % allImages.length);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewProduct]);

    const handleSave = async (
        data: ProductFormData,
        orderedImages: string[],
        images: File[],
    ) => {
        setSaving(true);
        let newDraftId: string | null = null;

        try {
            const productData: Record<string, unknown> = {
                title: data.title,
                brand: data.brand,
                gender: data.gender,
                category: data.category,
                slug: slugify(data.title),
                categorySlug: slugify(data.category),
                size: data.size,
                price: Number(data.price),
                retailPrice: data.retailPrice
                    ? Number(data.retailPrice)
                    : undefined,
                condition: data.condition,
                color: data.color,
                material: data.material,
                chest: data.chest,
                waist: data.waist,
                length: data.length,
                inseam: data.inseam,
                description: data.description,
                shippingInfo: data.shippingInfo,
            };

            const productId = editProduct?.id ?? (newDraftId = await apiCreateProduct(productData));
            const finalImageKeys: string[] = [];
            let fileIndex = 0;

            for (const [position, image] of orderedImages.entries()) {
                if (image.startsWith("blob:")) {
                    const file = images[fileIndex++];
                    if (!file) throw new Error("An image file is missing from the upload queue");
                    const uploaded = await uploadImageToR2(file, productId, position);
                    finalImageKeys.push(uploaded.key);
                } else {
                    finalImageKeys.push(image);
                }
            }

            await apiUpdateProduct(productId, {
                ...productData,
                images: finalImageKeys,
                ...(editProduct ? {} : { status: "active", isActive: true }),
            });

            showToast({
                type: "success",
                title: editProduct ? "Product updated" : "Product created",
            });
            setFormOpen(false);
            await loadProducts();
        } catch (error) {
            console.error("Save product error:", error);

            showToast({
                type: "error",
                title: newDraftId ? "Product saved as draft" : editProduct ? "Failed to update product" : "Failed to create product",
                message: error instanceof Error
                    ? `${error.message}${newDraftId ? ` Draft ID: ${newDraftId}` : ""}`
                    : "The product was not published.",
            });
        } finally {
            setSaving(false);
        }
    };

    // ── Render ──
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <ToastContainer />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Products</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {products.length} total &middot; {activeCount} active &middot; {draftCount}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadProducts} loading={loading} leftIcon={<RefreshCw size={14} />}>
                        Refresh
                    </Button>
                    <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus size={15} />}>
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10 dark:border-border dark:bg-card dark:text-foreground"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-0.5 dark:border-border dark:bg-card">
                        <Button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                                viewMode === "grid"
                                    ? "bg-foreground text-white shadow-sm dark:bg-muted dark:text-foreground"
                                    : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground"
                            )}
                        >
                            <Grid3X3 size={14} />
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                                viewMode === "list"
                                    ? "bg-foreground text-white shadow-sm dark:bg-muted dark:text-foreground"
                                    : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground"
                            )}
                        >
                            <List size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category filter chips */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                        categoryFilter === "all"
                            ? "bg-foreground text-white dark:bg-muted dark:text-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted dark:bg-card dark:text-muted-foreground"
                    )}
                >
                    All
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                            categoryFilter === cat
                                ? "bg-foreground text-white dark:bg-muted dark:text-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted dark:bg-card dark:text-muted-foreground"
                        )}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <ProductSkeleton view={viewMode} count={8} />
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
                        <AlertCircle size={28} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Failed to load</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{error}</p>
                    <Button variant="primary" size="sm" className="mt-6" onClick={loadProducts} leftIcon={<RefreshCw size={14} />}>
                        Try Again
                    </Button>
                </motion.div>
            ) : filteredProducts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Package size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                        {search || categoryFilter !== "all" ? "No products found" : "No products yet"}
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        {search || categoryFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Add your first product to start selling."}
                    </p>
                    {!search && categoryFilter === "all" && (
                        <Button variant="primary" size="sm" className="mt-6" onClick={openAddModal} leftIcon={<Plus size={15} />}>
                            Add Product
                        </Button>
                    )}
                </motion.div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.$id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:shadow-md dark:border-border/60"
                        >
                            {/* Image - clickable to preview */}
                            <Button
                                type="button"
                                onClick={() => {
                                    setPreviewProduct(product);
                                    setPreviewIndex(0);
                                }}
                                className="relative aspect-[4/3] w-full overflow-hidden bg-muted"
                            >
                                {product.primaryImage ? (
                                    <Image
                                        src={product.primaryImage}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Package size={32} className="text-muted-foreground dark:text-muted-foreground" />
                                    </div>
                                )}
                                {/* Image count badge */}
                                {product.images && product.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                        +{product.images.length - 1}
                                    </div>
                                )}
                                {/* Status badge */}
                                <div className="absolute left-2 top-2 flex gap-1.5">
                                    <span
                                        className={cn(
                                            "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                            product.isActive
                                                ? "bg-emerald-500/90 text-white"
                                                : "bg-subtle0/80 text-white"
                                        )}
                                    >
                                        {product.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {product.condition && (
                                        <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-sm dark:bg-card/80 dark:text-muted-foreground">
                                            {product.condition}
                                        </span>
                                    )}
                                </div>
                            </Button>

                            {/* Info */}
                            <div className="p-4">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    {product.brand}
                                </p>
                                <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">
                                    {product.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">
                                        ₹{product.price}
                                    </span>
                                    {product.retailPrice && product.retailPrice > product.price && (
                                        <span className="text-badge text-muted-foreground line-through">
                                            ₹{product.retailPrice}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-badge text-muted-foreground">
                                    <span>{product.category}</span>
                                    <span>&middot;</span>
                                    <span>{product.size}</span>
                                    <span>&middot;</span>
                                    <span>{product.gender}</span>
                                </div>
                                {/* Measurements - chest/waist left, length right */}
                                {(product.chest || product.waist || product.length) && (
                                    <div className="mt-1.5 flex items-center justify-between gap-1">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {getMeasurementValues(product)
                                                ?.filter((m) => m.label !== "Length")
                                                .map((m) => (
                                                    <span
                                                        key={m.label}
                                                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-badge font-semibold text-muted-foreground"
                                                        title={`${m.label}: ${m.value}`}
                                                    >
                                                        {m.label} {m.value}
                                                    </span>
                                                ))}
                                        </div>
                                        {getMeasurementValues(product)
                                            ?.filter((m) => m.label === "Length")
                                            .map((m) => (
                                                <span
                                                    key={m.label}
                                                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-badge font-semibold text-muted-foreground"
                                                >
                                                    {m.label} {m.value}
                                                </span>
                                            ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 dark:border-border">
                                    <Button
                                        variant="ghost"
                                        size="iconXs"
                                        onClick={() => openEditModal(product)}
                                        title="Edit"
                                    >
                                        <Edit3 size={13} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="iconXs"
                                        onClick={() =>
                                            handleToggleStatus(product.$id, product.isActive)
                                        }
                                        loading={updatingId === product.$id}
                                        title={product.isActive ? "Deactivate" : "Activate"}
                                        className={cn(
                                            product.isActive
                                                ? "text-emerald-600 hover:text-emerald-700"
                                                : "text-muted-foreground hover:text-muted-foreground"
                                        )}
                                    >
                                        {product.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="iconXs"
                                        onClick={() =>
                                            setDeleteTarget({ id: product.$id, title: product.title })
                                        }
                                        className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-2">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.$id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:shadow-md dark:border-border/60"
                        >
                            <Button
                                type="button"
                                onClick={() => {
                                    setPreviewProduct(product);
                                    setPreviewIndex(0);
                                }}
                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted"
                            >
                                {product.primaryImage ? (
                                    <Image
                                        src={product.primaryImage}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Package size={18} className="text-muted-foreground" />
                                    </div>
                                )}
                            </Button>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-foreground">
                                    {product.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {product.brand} &middot; {product.category} &middot; {product.size}
                                </p>
                                {/* Measurements - chest/waist left, length right */}
                                {(product.chest || product.waist || product.length) && (
                                    <div className="mt-1 flex items-center justify-between gap-1">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {getMeasurementValues(product)
                                                ?.filter((m) => m.label !== "Length")
                                                .map((m) => (
                                                    <span
                                                        key={m.label}
                                                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-badge font-semibold text-muted-foreground"
                                                    >
                                                        {m.label} {m.value}
                                                    </span>
                                                ))}
                                        </div>
                                        {getMeasurementValues(product)
                                            ?.filter((m) => m.label === "Length")
                                            .map((m) => (
                                                <span
                                                    key={m.label}
                                                    className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-badge font-semibold text-muted-foreground"
                                                >
                                                    {m.label} {m.value}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                                <span
                                    className={cn(
                                        "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                        product.isActive
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground dark:bg-card dark:text-muted-foreground"
                                    )}
                                >
                                    {product.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-foreground">
                                    ₹{product.price}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="iconXs"
                                    onClick={() => openEditModal(product)}
                                >
                                    <Edit3 size={13} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="iconXs"
                                    onClick={() =>
                                        handleToggleStatus(product.$id, product.isActive)
                                    }
                                    loading={updatingId === product.$id}
                                    className={cn(
                                        product.isActive
                                            ? "text-emerald-600"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {product.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="iconXs"
                                    onClick={() =>
                                        setDeleteTarget({ id: product.$id, title: product.title })
                                    }
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 size={13} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Product Form Modal */}
            <ProductFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                saving={saving}
                editProduct={editProduct}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleting}
            />

            {/* ── Full-Screen Image Preview ── */}
            <AnimatePresence>
                {previewProduct && (() => {
                    const allImages = previewProduct.images?.length
                        ? previewProduct.images
                        : previewProduct.primaryImage
                            ? [previewProduct.primaryImage]
                            : [];
                    const currentImage = allImages[previewIndex];
                    if (!currentImage) return null;

                    return (
                        <>
                            <motion.div
                                key="preview-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => {
                                    setPreviewProduct(null);
                                    setPreviewIndex(0);
                                }}
                                className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm"
                            />
                            <motion.div
                                key="preview-content"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="fixed inset-0 z-[60] flex items-center justify-center"
                            >
                                {/* Close button */}
                                <Button
                                    onClick={() => {
                                        setPreviewProduct(null);
                                        setPreviewIndex(0);
                                    }}
                                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                >
                                    <X size={20} />
                                </Button>

                                {/* Image counter */}
                                <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    {previewIndex + 1} / {allImages.length}
                                </div>

                                {/* Product info overlay */}
                                <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-2xl bg-white/10 px-5 py-3 text-center text-white backdrop-blur-sm">
                                    <p className="text-sm font-bold">{previewProduct.title}</p>
                                    <p className="text-xs text-white/70">
                                        {previewProduct.brand} &middot; ₹{previewProduct.price}
                                    </p>
                                </div>

                                {/* Previous button */}
                                {allImages.length > 1 && (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                                        }}
                                        className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                    >
                                        <ChevronLeft size={22} />
                                    </Button>
                                )}

                                {/* Image */}
                                <div
                                    className="relative flex h-full w-full items-center justify-center p-4 sm:p-8"
                                    onClick={() => {
                                        setPreviewProduct(null);
                                        setPreviewIndex(0);
                                    }}
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
                                            src={currentImage}
                                            alt={`${previewProduct.title} image ${previewIndex + 1}`}
                                            fill
                                            unoptimized
                                            className="object-contain"
                                            sizes="90vw"
                                        />
                                    </motion.div>
                                </div>

                                {/* Next button */}
                                {allImages.length > 1 && (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewIndex((prev) => (prev + 1) % allImages.length);
                                        }}
                                        className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                                    >
                                        <ChevronRight size={22} />
                                    </Button>
                                )}
                            </motion.div>
                        </>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
