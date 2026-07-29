"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    getAllProducts,
    toggleProductStatus,
    deleteProduct,
    createProduct as createProductService,
    updateProduct as updateProductService,
} from "@/lib/services/adminService";
import { uploadImages } from "@/lib/services/storage";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/admin/bulk/Toast";
import ToastContainer from "@/components/admin/bulk/Toast";
import ProductFormModal, { type ProductFormData } from "@/components/admin/products/ProductFormModal";
import ConfirmDialog from "@/components/admin/products/ConfirmDialog";

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
import ProductSkeleton from "@/components/admin/products/ProductSkeleton";

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

    status: string;
    isActive: boolean;
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
    } | null>(null);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProducts();
            setProducts(data as AdminProduct[]);
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
            const success = await toggleProductStatus(productId, !currentActive);
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
            const success = await deleteProduct(deleteTarget.id);
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
        });

        setFormOpen(true);
    };

    const handleSave = async (data: ProductFormData, orderedImageUrls: string[], filesToUpload: File[]) => {
        setSaving(true);
        try {
            // Upload any new files
            const uploadedUrls: string[] = [];
            if (filesToUpload.length > 0) {
                const uploaded = await uploadImages(filesToUpload);
                uploadedUrls.push(...uploaded.map((u) => u.url));
            }

            // Build final ordered image URLs
            // Replace new blob URLs with actual uploaded URLs
            let uploadIndex = 0;
            const finalImageUrls = orderedImageUrls.map((url) => {
                if (url.startsWith("blob:")) {
                    return uploadedUrls[uploadIndex++] || url;
                }
                return url;
            });

            const primaryImage = finalImageUrls[0] || "";

            const payload: Record<string, unknown> = {
                title: data.title,
                brand: data.brand,
                gender: data.gender,
                category: data.category,
                slug: slugify(data.title),
                categorySlug: slugify(data.category),
                size: data.size,
                price: Number(data.price),
                retailPrice: data.retailPrice ? Number(data.retailPrice) : undefined,
                condition: data.condition,
                color: data.color,
                material: data.material,
                chest: data.chest,
                waist: data.waist,
                length: data.length,
                inseam: data.inseam,
                description: data.description,
                shippingInfo: data.shippingInfo,
                primaryImage,
                images: finalImageUrls,
            };

            if (editProduct) {
                // Update existing
                const success = await updateProductService(editProduct.id, payload);
                if (success) {
                    showToast({ type: "success", title: "Product updated" });
                    setFormOpen(false);
                    loadProducts();
                } else {
                    showToast({ type: "error", title: "Failed to update product" });
                }
            } else {
                // Create new
                const success = await createProductService(payload);
                if (success) {
                    showToast({ type: "success", title: "Product created" });
                    setFormOpen(false);
                    loadProducts();
                } else {
                    showToast({ type: "error", title: "Failed to create product" });
                }
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast({ type: "error", title: "Something went wrong" });
        } finally {
            setSaving(false);
        }
    }

    // ── Render ──

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <ToastContainer />

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Products</h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {products.length} total &middot; {activeCount} active &middot; {draftCount}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadProducts} loading={loading}>
                        <RefreshCw size={14} />
                        Refresh
                    </Button>
                    <Button variant="primary" size="sm" onClick={openAddModal}>
                        <Plus size={15} />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                                viewMode === "grid"
                                    ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                            )}
                        >
                            <Grid3X3 size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                                viewMode === "list"
                                    ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                            )}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Category filter chips */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                        categoryFilter === "all"
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                    )}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                            categoryFilter === cat
                                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                        )}
                    >
                        {cat}
                    </button>
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
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Failed to load</h3>
                    <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
                    <Button variant="primary" size="sm" className="mt-6" onClick={loadProducts}>
                        <RefreshCw size={14} />
                        Try Again
                    </Button>
                </motion.div>
            ) : filteredProducts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                        <Package size={28} className="text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {search || categoryFilter !== "all" ? "No products found" : "No products yet"}
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                        {search || categoryFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Add your first product to start selling."}
                    </p>
                    {!search && categoryFilter === "all" && (
                        <Button variant="primary" size="sm" className="mt-6" onClick={openAddModal}>
                            <Plus size={15} />
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
                            className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700/60 dark:bg-neutral-900"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
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
                                        <Package size={32} className="text-neutral-300 dark:text-neutral-600" />
                                    </div>
                                )}
                                {/* Status badge */}
                                <div className="absolute left-2 top-2 flex gap-1.5">
                                    <span
                                        className={cn(
                                            "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                            product.isActive
                                                ? "bg-emerald-500/90 text-white"
                                                : "bg-neutral-500/80 text-white"
                                        )}
                                    >
                                        {product.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {product.condition && (
                                        <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 backdrop-blur-sm dark:bg-neutral-800/80 dark:text-neutral-300">
                                            {product.condition}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                    {product.brand}
                                </p>
                                <h3 className="mt-0.5 truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    {product.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        ₹{product.price}
                                    </span>
                                    {product.retailPrice && product.retailPrice > product.price && (
                                        <span className="text-[10px] text-neutral-400 line-through">
                                            ₹{product.retailPrice}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                                    <span>{product.category}</span>
                                    <span>&middot;</span>
                                    <span>{product.size}</span>
                                    <span>&middot;</span>
                                    <span>{product.gender}</span>
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
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
                                                : "text-neutral-400 hover:text-neutral-600"
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
                            className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-700/60 dark:bg-neutral-900"
                        >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
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
                                        <Package size={18} className="text-neutral-300" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    {product.title}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {product.brand} &middot; {product.category} &middot; {product.size}
                                </p>
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                                <span
                                    className={cn(
                                        "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                        product.isActive
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                    )}
                                >
                                    {product.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
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
                                            : "text-neutral-400"
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
        </div>
    );
}

