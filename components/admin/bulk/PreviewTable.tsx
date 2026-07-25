"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";

export interface BulkPreviewProduct {
    sku: string;
    image: string;
    brand: string;
    title: string;
    category: string;
    price: number;
    errors: string[];
    status: string;
}

interface PreviewTableProps {
    products: BulkProduct[];
}

export default function PreviewTable({ products }: PreviewTableProps) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(
            (p) =>
                p.sku.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q)
        );
    }, [products, search]);

    const ready = filtered.filter((p) => p.errors.length === 0).length;
    const issues = filtered.filter((p) => p.errors.length > 0).length;

    return (
        <div className="rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-700/50 dark:bg-neutral-900">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Product Preview
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                        {ready > 0 && (
                            <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                                &middot; {ready} ready
                            </span>
                        )}
                        {issues > 0 && (
                            <span className="ml-1 text-red-600 dark:text-red-400">
                                &middot; {issues} issue{issues !== 1 ? "s" : ""}
                            </span>
                        )}
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search SKU, brand, title..."
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-800"
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
                            <th className="py-3 pl-4 pr-2">SKU</th>
                            <th className="px-2 py-3">Image</th>
                            <th className="px-2 py-3">Brand</th>
                            <th className="px-2 py-3">Title</th>
                            <th className="px-2 py-3">Category</th>
                            <th className="px-2 py-3">Price</th>
                            <th className="px-2 py-3">Images</th>
                            <th className="pr-4 pl-2 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-sm text-neutral-400">
                                    {products.length === 0
                                        ? "Upload an Excel file to preview products"
                                        : "No products match your search"}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((product) => {
                                const hasErrors = product.errors.length > 0;
                                return (
                                    <tr
                                        key={product.sku}
                                        className={`border-b border-neutral-100 text-sm transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50 ${hasErrors ? "bg-red-50/30 dark:bg-red-950/10" : ""
                                            }`}
                                    >
                                        <td className="py-3 pl-4 pr-2">
                                            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                                {product.primaryImage ? (
                                                    <Image
                                                        src={product.primaryImage}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                                                        —
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="max-w-[100px] truncate px-2 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                                            {product.brand || <span className="text-neutral-400">—</span>}
                                        </td>
                                        <td className="max-w-[160px] truncate px-2 py-3 text-neutral-600 dark:text-neutral-400">
                                            {product.title || <span className="text-neutral-400">—</span>}
                                        </td>
                                        <td className="px-2 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            {product.category}
                                        </td>
                                        <td className="px-2 py-3 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                            ₹{product.price}
                                        </td>
                                        <td className="px-2 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            {product.imageFiles.length}
                                        </td>
                                        <td className="pr-4 pl-2 py-3">
                                            {hasErrors ? (
                                                <span className="group relative inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    <AlertCircle size={10} />
                                                    {product.errors.length} error{product.errors.length !== 1 ? "s" : ""}
                                                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-xl border border-red-200 bg-white p-3 shadow-lg group-hover:block dark:border-red-800 dark:bg-neutral-900">
                                                        <p className="text-[10px] font-semibold text-red-600 dark:text-red-400">Issues</p>
                                                        <ul className="mt-1 space-y-0.5">
                                                            {product.errors.map((err, i) => (
                                                                <li key={i} className="text-[10px] text-neutral-600 dark:text-neutral-400">
                                                                    &bull; {err}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <CheckCircle2 size={10} />
                                                    Ready
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-neutral-100 md:hidden dark:divide-neutral-800">
                {filtered.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-400">
                        {products.length === 0
                            ? "Upload an Excel file to preview products"
                            : "No products match your search"}
                    </div>
                ) : (
                    filtered.map((product) => {
                        const hasErrors = product.errors.length > 0;
                        return (
                            <div
                                key={product.sku}
                                className={`flex items-start gap-3 p-4 ${hasErrors ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    {product.primaryImage ? (
                                        <Image
                                            src={product.primaryImage}
                                            alt=""
                                            width={48}
                                            height={48}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                                            —
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {product.sku}
                                            </p>
                                            <p className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                {product.title || product.brand || <span className="text-neutral-400">Untitled</span>}
                                            </p>
                                        </div>
                                        <span className="shrink-0 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                            ₹{product.price}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        {product.brand && (
                                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                {product.brand}
                                            </span>
                                        )}
                                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                            {product.category}
                                        </span>
                                        <span className="text-[10px] text-neutral-400">{product.imageFiles.length} img</span>
                                        {hasErrors ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                <AlertCircle size={10} />
                                                {product.errors.length}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <CheckCircle2 size={10} />
                                                Ready
                                            </span>
                                        )}
                                    </div>
                                    {hasErrors && (
                                        <div className="mt-2 rounded-lg bg-red-100/70 px-2.5 py-1.5 dark:bg-red-900/20">
                                            {product.errors.map((err, i) => (
                                                <p key={i} className="text-[10px] leading-relaxed text-red-700 dark:text-red-400">
                                                    &bull; {err}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

