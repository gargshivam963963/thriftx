"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { BulkProduct } from "@/app/lib/bulk/types";

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
                p.title.toLowerCase().includes(q),
        );
    }, [products, search]);

    const ready = filtered.filter((p) => p.errors.length === 0).length;
    const issues = filtered.filter((p) => p.errors.length > 0).length;

    if (products.length === 0) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-sm">Product Preview</CardTitle>
                    <CardDescription className="text-xs">
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
                    </CardDescription>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search SKU, brand, title..."
                        className="h-9 pl-9 text-xs"
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <div className="max-h-[calc(100vh-16rem)] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
                                <TableRow>
                                    <TableHead className="sticky left-0 z-20 bg-muted/50 backdrop-blur min-w-[80px]">SKU</TableHead>
                                    <TableHead className="min-w-[60px]">Image</TableHead>
                                    <TableHead className="min-w-[100px]">Brand</TableHead>
                                    <TableHead className="min-w-[140px]">Title</TableHead>
                                    <TableHead className="min-w-[100px]">Category</TableHead>
                                    <TableHead className="min-w-[80px]">Price</TableHead>
                                    <TableHead className="min-w-[60px]">Images</TableHead>
                                    <TableHead className="min-w-[90px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            {products.length === 0
                                                ? "Upload an Excel file to preview products"
                                                : "No products match your search"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((product) => {
                                        const hasErrors = product.errors.length > 0;
                                        return (
                                            <TableRow
                                                key={product.sku}
                                                className={hasErrors ? "bg-destructive/5" : ""}
                                            >
                                                <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs font-bold">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
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
                                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                                —
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[100px] truncate font-medium">
                                                    {product.brand || <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="max-w-[160px] truncate">
                                                    {product.title || <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {product.category}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm font-bold">
                                                    ₹{product.price}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {product.imageFiles.length}
                                                </TableCell>
                                                <TableCell>
                                                    {hasErrors ? (
                                                        <Badge variant="error" className="gap-1 text-[10px]">
                                                            <AlertCircle size={10} />
                                                            {product.errors.length}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success" className="gap-1 text-[10px]">
                                                            <CheckCircle2 size={10} />
                                                            Ready
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="divide-y md:hidden">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
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
                                    className={`flex items-start gap-3 p-4 ${hasErrors ? "bg-destructive/5" : ""}`}
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
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
                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                —
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-bold text-foreground">{product.sku}</p>
                                                <p className="truncate text-sm font-medium">
                                                    {product.title || product.brand || <span className="text-muted-foreground">Untitled</span>}
                                                </p>
                                            </div>
                                            <span className="shrink-0 font-mono text-sm font-bold">₹{product.price}</span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            {product.brand && <Badge variant="secondary" className="text-[10px]">{product.brand}</Badge>}
                                            <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{product.imageFiles.length} img</span>
                                            {hasErrors ? (
                                                <Badge variant="error" className="gap-1 text-[10px]">
                                                    <AlertCircle size={10} />
                                                    {product.errors.length}
                                                </Badge>
                                            ) : (
                                                <Badge variant="success" className="gap-1 text-[10px]">
                                                    <CheckCircle2 size={10} />
                                                    Ready
                                                </Badge>
                                            )}
                                        </div>
                                        {hasErrors && (
                                            <div className="mt-2 rounded-lg bg-destructive/10 px-2.5 py-1.5">
                                                {product.errors.map((err, i) => (
                                                    <p key={i} className="text-[10px] leading-relaxed text-destructive">
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
            </CardContent>
        </Card>
    );
}
