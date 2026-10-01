"use client";

import {
    ChangeEvent,
    DragEvent,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import {
    Check,
    ChevronDown,
    Copy,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Plus,
    Sparkles,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Props {
    products: BulkProduct[];
    onUpdate: (
        sku: string,
        updates: Partial<BulkProduct>,
    ) => void;
    onAddRow: () => void;
    onDeleteRow: (sku: string) => void;
    onDuplicateRow: (sku: string) => void;
    onImagesChange: (
        sku: string,
        files: File[],
    ) => void;
    onAiFill: (sku: string) => void;
    aiLoadingSku: string | null;
    onUpload: () => void;
    uploading: boolean;

    bulkAiLoading?: boolean;
    onAiFillAll?: () => void;

    onFilesSelected?: (
        files: File[],
    ) => void;
    onFolderSelected?: (
        files: File[],
    ) => void;

    aiProcessing?: boolean;
    aiProcessingInfo?: {
        current: number;
        total: number;
        currentSku: string;
    } | null;

    loading?: boolean;
}

interface EditableCellProps {
    value: string | number | undefined;
    placeholder?: string;
    type?: "text" | "number";
    onChange: (
        value: string,
    ) => void;
    className?: string;
}

function EditableCell({
    value,
    placeholder,
    type = "text",
    onChange,
    className,
}: EditableCellProps) {
    return (
        <Input
            value={
                value === undefined
                    ? ""
                    : String(value)
            }
            placeholder={placeholder}
            type={type}
            onChange={(event) =>
                onChange(event.target.value)
            }
            className={cn(
                "h-9 min-w-[100px] border-transparent bg-transparent px-2",
                "shadow-none focus:border-border focus:bg-background",
                className,
            )}
        />
    );
}

const UPPER_CATEGORIES = new Set([
    "T-Shirts",
    "Shirts",
    "Hoodies",
    "Sweatshirts",
    "Jackets",
    "Blazers",
    "Tops",
]);

const LOWER_CATEGORIES = new Set([
    "Jeans",
    "Cargo",
    "Trousers",
    "Shorts",
    "Skirts",
    "Lower",
]);

function isChestRequired(category: string): boolean {
    return UPPER_CATEGORIES.has(category);
}

function isWaistRequired(category: string): boolean {
    return LOWER_CATEGORIES.has(category);
}

function ColumnLabel({
    children,
    required = false,
    optional = false,
}: {
    children: React.ReactNode;
    required?: boolean;
    optional?: boolean;
}) {
    return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {children}
            {required && (
                <span
                    className="font-bold text-red-500"
                    aria-label="required"
                >
                    *
                </span>
            )}
            {optional && (
                <span className="font-normal text-[10px] text-muted-foreground">
                    optional
                </span>
            )}
        </span>
    );
}

function ImageThumb({
    src,
    index,
    onRemove,
}: {
    src: string;
    index: number;
    onRemove?: () => void;
}) {
    return (
        <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
            <Image
                src={src}
                alt={`Product image ${index + 1
                    }`}
                width={48}
                height={48}
                unoptimized
                className="h-full w-full object-cover"
            />

            {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-center text-[8px] font-medium text-white">
                    FRONT
                </span>
            )}

            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute right-0.5 top-0.5 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex"
                    aria-label="Remove image"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

export default function SpreadsheetEditor({
    products,
    onUpdate,
    onAddRow,
    onDeleteRow,
    onDuplicateRow,
    onImagesChange,
    onAiFill,
    aiLoadingSku,
    onUpload,
    uploading,
    bulkAiLoading = false,
    onAiFillAll,
    onFilesSelected,
    onFolderSelected,
    aiProcessing = false,
    aiProcessingInfo = null,
    loading = false,
}: Props) {
    const folderInputRef =
        useRef<HTMLInputElement>(null);
    const imageInputRefs =
        useRef<Record<string, HTMLInputElement | null>>(
            {},
        );

    const [dragging, setDragging] =
        useState(false);

    const [preview, setPreview] =
        useState<{
            sku: string;
            index: number;
        } | null>(null);

    const readyCount = useMemo(
        () =>
            products.filter(
                (product) =>
                    product.status ===
                    "Ready" &&
                    product.errors.length === 0,
            ).length,
        [products],
    );

    const invalidCount = useMemo(
        () =>
            products.filter(
                (product) =>
                    product.status ===
                    "Invalid",
            ).length,
        [products],
    );

    const imageCount = useMemo(
        () =>
            products.reduce(
                (total, product) =>
                    total +
                    product.imageFiles.length,
                0,
            ),
        [products],
    );

    const handleFolderInput = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(
            event.target.files ?? [],
        );

        if (!files.length) return;

        const hasFolderStructure =
            files.some((file) =>
                Boolean(
                    (
                        file as File & {
                            webkitRelativePath?: string;
                        }
                    )
                        .webkitRelativePath,
                ),
            );

        if (
            hasFolderStructure &&
            onFolderSelected
        ) {
            onFolderSelected(files);
        } else {
            onFilesSelected?.(files);
        }

        event.target.value = "";
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        setDragging(false);

        const files = Array.from(
            event.dataTransfer.files ?? [],
        );

        if (!files.length) return;

        const hasFolderStructure =
            files.some((file) =>
                Boolean(
                    (
                        file as File & {
                            webkitRelativePath?: string;
                        }
                    )
                        .webkitRelativePath,
                ),
            );

        if (
            hasFolderStructure &&
            onFolderSelected
        ) {
            onFolderSelected(files);
        } else {
            onFilesSelected?.(files);
        }
    };

    const handleImagesForProduct = (
        sku: string,
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(
            event.target.files ?? [],
        );

        if (files.length) {
            onImagesChange(sku, files);
        }

        event.target.value = "";
    };

    const removeImage = (
        product: BulkProduct,
        index: number,
    ) => {
        const files = product.imageFiles.filter(
            (_, fileIndex) =>
                fileIndex !== index,
        );

        onImagesChange(product.sku, files);

        if (
            preview &&
            preview.sku === product.sku
        ) {
            setPreview(null);
        }
    };

    const getFieldClass = (
        product: BulkProduct,
        field: string,
    ) => {
        const needsReview =
            product.aiNeedsReview?.includes(
                field,
            );

        return cn(
            needsReview &&
            "border-amber-300 bg-amber-50/60",
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-32 animate-pulse rounded-2xl border bg-muted/40" />
                <div className="h-[500px] animate-pulse rounded-2xl border bg-muted/40" />
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 max-w-full space-y-4 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Bulk Upload
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Upload product folders, let AI
                        identify and fill the details,
                        review, then create all.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                        {products.length} products
                    </Badge>

                    <Badge variant="outline">
                        {imageCount} images
                    </Badge>

                    {readyCount > 0 && (
                        <Badge>
                            <Check className="mr-1 h-3 w-3" />
                            {readyCount} ready
                        </Badge>
                    )}

                    {invalidCount > 0 && (
                        <Badge variant="error">
                            {invalidCount} need fixes
                        </Badge>
                    )}
                </div>
            </div>

            {/* Folder Upload Area */}
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setDragging(false);
                }}
                onDrop={handleDrop}
                className={cn(
                    "relative overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all",
                    dragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20 bg-muted/20 hover:border-muted-foreground/40",
                )}
            >
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div>
                        <p className="font-medium">
                            Drop your product folder here
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            One subfolder per product ·
                            3+ images recommended
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                folderInputRef.current?.click()
                            }
                            disabled={
                                uploading ||
                                aiProcessing ||
                                bulkAiLoading
                            }
                        >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Choose Folder
                        </Button>

                        {onFilesSelected && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    imageInputRefs.current[
                                        "__global__"
                                    ]?.click()
                                }
                                disabled={
                                    uploading ||
                                    aiProcessing ||
                                    bulkAiLoading
                                }
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Add Images
                            </Button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP or AVIF
                    </p>
                </div>

                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFolderInput}
                    {...({
                        webkitdirectory:
                            "",
                        directory: "",
                    } as React.InputHTMLAttributes<HTMLInputElement>)}
                />

                <input
                    ref={(element) => {
                        imageInputRefs.current[
                            "__global__"
                        ] = element;
                    }}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(event) => {
                        const files =
                            Array.from(
                                event.target
                                    .files ?? [],
                            );

                        if (files.length) {
                            onFilesSelected?.(
                                files,
                            );
                        }

                        event.target.value = "";
                    }}
                />
            </div>

            {/* AI processing banner */}
            {(aiProcessing ||
                bulkAiLoading) && (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                                AI is analyzing products
                            </p>

                            {aiProcessingInfo && (
                                <p className="truncate text-xs text-muted-foreground">
                                    Product{" "}
                                    {
                                        aiProcessingInfo.current
                                    }{" "}
                                    of{" "}
                                    {
                                        aiProcessingInfo.total
                                    }{" "}
                                    ·{" "}
                                    {
                                        aiProcessingInfo.currentSku
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}

            {/* Toolbar */}
            <div className="flex flex-col gap-2 rounded-xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddRow}
                        disabled={
                            uploading ||
                            aiProcessing
                        }
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Product
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAiFillAll}
                        disabled={
                            uploading ||
                            aiProcessing ||
                            bulkAiLoading ||
                            products.length === 0
                        }
                    >
                        {bulkAiLoading ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-1.5 h-4 w-4" />
                        )}
                        AI Fill All
                    </Button>
                </div>

                <Button
                    type="button"
                    size="sm"
                    onClick={onUpload}
                    disabled={
                        uploading ||
                        aiProcessing ||
                        bulkAiLoading ||
                        readyCount === 0
                    }
                >
                    {uploading ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-1.5 h-4 w-4" />
                    )}
                    Create All
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-muted-foreground">
                <span><span className="font-bold text-red-500">*</span> Required</span>
                <span>Chest is required for upperwear categories</span>
                <span>Waist is required for lowerwear categories</span>
                <span>Length, retail, color are optional</span>
            </div>

            {/* Desktop Grid */}
            <div className="hidden w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-background lg:block">
                <div className="relative w-full max-w-full overflow-x-auto overflow-y-auto">
                    <div className="max-h-[calc(100vh-350px)] min-w-0">
                        <Table className="w-max min-w-[1800px]">
                            <TableHeader className="sticky top-0 z-20 bg-background">
                                <TableRow>
                                    <TableHead className="w-12">
                                        #
                                    </TableHead>

                                    <TableHead className="min-w-[190px]">
                                        <ColumnLabel required>Images</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[130px]">
                                        <ColumnLabel required>SKU</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[220px]">
                                        <ColumnLabel required>Title</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[130px]">
                                        <ColumnLabel required>Brand</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[130px]">
                                        <ColumnLabel required>Gender</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[150px]">
                                        <ColumnLabel required>Category</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[110px]">
                                        <ColumnLabel required>Price</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[110px]">
                                        <ColumnLabel optional>Retail</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[130px]">
                                        <ColumnLabel required>Condition</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[100px]">
                                        <ColumnLabel required>Size</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[110px]">
                                        <ColumnLabel required>Chest</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[110px]">
                                        <ColumnLabel required>Waist</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[110px]">
                                        <ColumnLabel optional>Length</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[120px]">
                                        <ColumnLabel optional>Color</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="min-w-[150px]">
                                        <ColumnLabel required>Material</ColumnLabel>
                                    </TableHead>

                                    <TableHead className="w-[170px]">
                                        Status
                                    </TableHead>

                                    <TableHead className="sticky right-0 z-10 w-[130px] bg-background">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={18}
                                            className="h-48 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <FolderOpen className="h-8 w-8" />
                                                <p className="font-medium text-foreground">
                                                    No products yet
                                                </p>
                                                <p className="text-sm">
                                                    Drop a product
                                                    folder above
                                                    to get started.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map(
                                        (
                                            product,
                                            index,
                                        ) => {
                                            return (
                                                <TableRow
                                                    key={
                                                        product.sku
                                                    }
                                                    className={cn(
                                                        product.errors
                                                            .length >
                                                        0 &&
                                                        "bg-destructive/5",
                                                    )}
                                                >
                                                    <TableCell className="align-top text-xs text-muted-foreground">
                                                        {index +
                                                            1}
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <div className="flex max-w-[190px] gap-1.5 overflow-x-auto pb-1">
                                                            {product.imageUrls
                                                                .slice(
                                                                    0,
                                                                    5,
                                                                )
                                                                .map(
                                                                    (
                                                                        src,
                                                                        imageIndex,
                                                                    ) => (
                                                                        <button
                                                                            key={`${product.sku}-${imageIndex}`}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setPreview(
                                                                                    {
                                                                                        sku: product.sku,
                                                                                        index: imageIndex,
                                                                                    },
                                                                                )
                                                                            }
                                                                        >
                                                                            <ImageThumb
                                                                                src={
                                                                                    src
                                                                                }
                                                                                index={
                                                                                    imageIndex
                                                                                }
                                                                            />
                                                                        </button>
                                                                    ),
                                                                )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    imageInputRefs.current[
                                                                        product.sku
                                                                    ]?.click()
                                                                }
                                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <input
                                                            ref={(
                                                                element,
                                                            ) => {
                                                                imageInputRefs.current[
                                                                    product.sku
                                                                ] =
                                                                    element;
                                                            }}
                                                            type="file"
                                                            multiple
                                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                                            className="hidden"
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                handleImagesForProduct(
                                                                    product.sku,
                                                                    event,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.sku
                                                            }
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        sku: value,
                                                                    },
                                                                )
                                                            }
                                                            className="font-mono text-xs"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.title
                                                            }
                                                            placeholder="Product title"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        title: value,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "title",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.brand
                                                            }
                                                            placeholder="Brand"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        brand: value,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "brand",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <select
                                                            value={
                                                                product.gender
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        gender: event
                                                                            .target
                                                                            .value as BulkProduct["gender"],
                                                                    },
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-sm outline-none",
                                                                "focus:border-border focus:bg-background",
                                                                getFieldClass(
                                                                    product,
                                                                    "gender",
                                                                ),
                                                            )}
                                                        >
                                                            <option value="Men">
                                                                Men
                                                            </option>
                                                            <option value="Women">
                                                                Women
                                                            </option>
                                                            <option value="Kids">
                                                                Kids
                                                            </option>
                                                            <option value="Unisex">
                                                                Unisex
                                                            </option>
                                                        </select>
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.category
                                                            }
                                                            placeholder="Category"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        category:
                                                                            value,
                                                                        categorySlug:
                                                                            value
                                                                                .toLowerCase()
                                                                                .trim()
                                                                                .replace(
                                                                                    /[^a-z0-9]+/g,
                                                                                    "-",
                                                                                )
                                                                                .replace(
                                                                                    /^-+|-+$/g,
                                                                                    "",
                                                                                ),
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "category",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            type="number"
                                                            value={
                                                                product.price
                                                            }
                                                            placeholder="0"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        price:
                                                                            Number(
                                                                                value,
                                                                            ) ||
                                                                            0,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "price",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            type="number"
                                                            value={
                                                                product.retailPrice
                                                            }
                                                            placeholder="Retail price"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        retailPrice:
                                                                            value
                                                                                ? Number(
                                                                                    value,
                                                                                )
                                                                                : undefined,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.condition
                                                            }
                                                            placeholder="Condition"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        condition:
                                                                            value,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "condition",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.size
                                                            }
                                                            placeholder="Size"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        size: value,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "size",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={product.chest}
                                                            placeholder="Chest"
                                                            onChange={(value) =>
                                                                onUpdate(product.sku, {
                                                                    chest: value,
                                                                })
                                                            }
                                                            className={getFieldClass(product, "chest")}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={product.waist}
                                                            placeholder="Waist"
                                                            onChange={(value) =>
                                                                onUpdate(product.sku, {
                                                                    waist: value,
                                                                })
                                                            }
                                                            className={getFieldClass(product, "waist")}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={product.length}
                                                            placeholder="Length"
                                                            onChange={(value) =>
                                                                onUpdate(product.sku, {
                                                                    length: value,
                                                                })
                                                            }
                                                            className={getFieldClass(product, "length")}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.color
                                                            }
                                                            placeholder="Color"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        color: value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <EditableCell
                                                            value={
                                                                product.material
                                                            }
                                                            placeholder="Material"
                                                            onChange={(
                                                                value,
                                                            ) =>
                                                                onUpdate(
                                                                    product.sku,
                                                                    {
                                                                        material:
                                                                            value,
                                                                    },
                                                                )
                                                            }
                                                            className={getFieldClass(
                                                                product,
                                                                "material",
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="align-top">
                                                        <div className="space-y-1">
                                                            <Badge
                                                                variant={
                                                                    product.status ===
                                                                        "Ready"
                                                                        ? "default"
                                                                        : product.status ===
                                                                            "Invalid"
                                                                            ? "error"
                                                                            : "outline"
                                                                }
                                                            >
                                                                {
                                                                    product.status
                                                                }
                                                            </Badge>

                                                            {product.errors
                                                                .length >
                                                                0 && (
                                                                    <p className="max-w-[150px] text-[10px] leading-tight text-destructive">
                                                                        {
                                                                            product
                                                                                .errors[0]
                                                                        }
                                                                        {product
                                                                            .errors
                                                                            .length >
                                                                            1 &&
                                                                            ` +${product
                                                                                .errors
                                                                                .length -
                                                                            1
                                                                            }`}
                                                                    </p>
                                                                )}

                                                            {product.aiGenerated && (
                                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    AI filled
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="sticky right-0 z-10 bg-background align-top">
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="iconMd"
                                                                title="AI Fill"
                                                                disabled={
                                                                    aiLoadingSku ===
                                                                    product.sku ||
                                                                    uploading ||
                                                                    !product.imageFiles.length
                                                                }
                                                                onClick={() =>
                                                                    onAiFill(
                                                                        product.sku,
                                                                    )
                                                                }
                                                            >
                                                                {aiLoadingSku ===
                                                                    product.sku ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="h-4 w-4" />
                                                                )}
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="iconMd"
                                                                title="Duplicate"
                                                                disabled={
                                                                    uploading
                                                                }
                                                                onClick={() =>
                                                                    onDuplicateRow(
                                                                        product.sku,
                                                                    )
                                                                }
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="iconMd"
                                                                title="Delete"
                                                                disabled={
                                                                    uploading
                                                                }
                                                                onClick={() =>
                                                                    onDeleteRow(
                                                                        product.sku,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="space-y-3 lg:hidden">
                {products.length === 0 ? (
                    <div className="rounded-xl border p-8 text-center">
                        <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 font-medium">
                            No products yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload a product folder
                            above.
                        </p>
                    </div>
                ) : (
                    products.map(
                        (product, index) => {
                            return (
                                <div
                                    key={
                                        product.sku
                                    }
                                    className={cn(
                                        "overflow-hidden rounded-xl border bg-background",
                                        product.errors
                                            .length >
                                        0 &&
                                        "border-destructive/40",
                                    )}
                                >
                                    <div className="flex items-center justify-between border-b px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                #
                                                {index +
                                                    1}
                                            </span>

                                            <Badge
                                                variant={
                                                    product.status ===
                                                        "Ready"
                                                        ? "default"
                                                        : product.status ===
                                                            "Invalid"
                                                            ? "error"
                                                            : "outline"
                                                }
                                            >
                                                {
                                                    product.status
                                                }
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="iconMd"
                                                disabled={
                                                    aiLoadingSku ===
                                                    product.sku ||
                                                    uploading ||
                                                    !product.imageFiles.length
                                                }
                                                onClick={() =>
                                                    onAiFill(
                                                        product.sku,
                                                    )
                                                }
                                            >
                                                {aiLoadingSku ===
                                                    product.sku ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="iconMd"
                                                onClick={() =>
                                                    onDuplicateRow(
                                                        product.sku,
                                                    )
                                                }
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="iconMd"
                                                onClick={() =>
                                                    onDeleteRow(
                                                        product.sku,
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-3">
                                        <div className="flex gap-2 overflow-x-auto">
                                            {product.imageUrls.map(
                                                (
                                                    src,
                                                    imageIndex,
                                                ) => (
                                                    <button
                                                        key={`${product.sku}-mobile-${imageIndex}`}
                                                        type="button"
                                                        onClick={() =>
                                                            setPreview(
                                                                {
                                                                    sku: product.sku,
                                                                    index: imageIndex,
                                                                },
                                                            )
                                                        }
                                                        className="shrink-0"
                                                    >
                                                        <ImageThumb
                                                            src={
                                                                src
                                                            }
                                                            index={
                                                                imageIndex
                                                            }
                                                        />
                                                    </button>
                                                ),
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    imageInputRefs.current[
                                                        product.sku
                                                    ]?.click()
                                                }
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <input
                                            ref={(
                                                element,
                                            ) => {
                                                imageInputRefs.current[
                                                    product.sku
                                                ] =
                                                    element;
                                            }}
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                            className="hidden"
                                            onChange={(
                                                event,
                                            ) =>
                                                handleImagesForProduct(
                                                    product.sku,
                                                    event,
                                                )
                                            }
                                        />

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Title <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.title
                                                    }
                                                    placeholder="Product title"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                title: value,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "title",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    SKU <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.sku
                                                    }
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                sku: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Brand <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.brand
                                                    }
                                                    placeholder="Brand"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                brand: value,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "brand",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Gender <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <select
                                                    value={
                                                        product.gender
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                gender: event
                                                                    .target
                                                                    .value as BulkProduct["gender"],
                                                            },
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                                                >
                                                    <option value="Men">
                                                        Men
                                                    </option>
                                                    <option value="Women">
                                                        Women
                                                    </option>
                                                    <option value="Kids">
                                                        Kids
                                                    </option>
                                                    <option value="Unisex">
                                                        Unisex
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Category <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.category
                                                    }
                                                    placeholder="Category"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                category:
                                                                    value,
                                                                categorySlug:
                                                                    value
                                                                        .toLowerCase()
                                                                        .trim()
                                                                        .replace(
                                                                            /[^a-z0-9]+/g,
                                                                            "-",
                                                                        )
                                                                        .replace(
                                                                            /^-+|-+$/g,
                                                                            "",
                                                                        ),
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "category",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Price <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    type="number"
                                                    value={
                                                        product.price
                                                    }
                                                    placeholder="0"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                price:
                                                                    Number(
                                                                        value,
                                                                    ) ||
                                                                    0,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "price",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Retail Price <span className="font-normal text-muted-foreground">optional</span>
                                                </label>

                                                <EditableCell
                                                    type="number"
                                                    value={
                                                        product.retailPrice
                                                    }
                                                    placeholder="Retail price"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                retailPrice:
                                                                    value
                                                                        ? Number(
                                                                            value,
                                                                        )
                                                                        : undefined,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Condition <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.condition
                                                    }
                                                    placeholder="Condition"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                condition:
                                                                    value,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "condition",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Size <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.size
                                                    }
                                                    placeholder="Size"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                size: value,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "size",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Chest {isChestRequired(product.category) && (
                                                        <span className="font-bold text-red-500">*</span>
                                                    )}
                                                </label>
                                                <EditableCell
                                                    value={product.chest}
                                                    placeholder="Chest"
                                                    onChange={(value) =>
                                                        onUpdate(product.sku, { chest: value })
                                                    }
                                                    className={getFieldClass(product, "chest")}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Waist {isWaistRequired(product.category) && (
                                                        <span className="font-bold text-red-500">*</span>
                                                    )}
                                                </label>
                                                <EditableCell
                                                    value={product.waist}
                                                    placeholder="Waist"
                                                    onChange={(value) =>
                                                        onUpdate(product.sku, { waist: value })
                                                    }
                                                    className={getFieldClass(product, "waist")}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Length <span className="font-normal text-muted-foreground">optional</span>
                                                </label>
                                                <EditableCell
                                                    value={product.length}
                                                    placeholder="Length"
                                                    onChange={(value) =>
                                                        onUpdate(product.sku, { length: value })
                                                    }
                                                    className={getFieldClass(product, "length")}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Color <span className="font-normal text-muted-foreground">optional</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.color
                                                    }
                                                    placeholder="Color"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                color: value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                    Material <span className="font-bold text-red-500">*</span>
                                                </label>

                                                <EditableCell
                                                    value={
                                                        product.material
                                                    }
                                                    placeholder="Material"
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        onUpdate(
                                                            product.sku,
                                                            {
                                                                material:
                                                                    value,
                                                            },
                                                        )
                                                    }
                                                    className={getFieldClass(
                                                        product,
                                                        "material",
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {product.errors.length >
                                            0 && (
                                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                                    <p className="text-xs font-medium text-destructive">
                                                        Fix before
                                                        creating:
                                                    </p>

                                                    <ul className="mt-1 list-disc pl-4 text-xs text-destructive">
                                                        {product.errors
                                                            .slice(
                                                                0,
                                                                5,
                                                            )
                                                            .map(
                                                                (
                                                                    error,
                                                                    errorIndex,
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            errorIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            error
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                    </ul>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            );
                        },
                    )
                )}
            </div>

            {/* Preview Modal */}
            {preview && (
                <ImagePreviewModal
                    products={products}
                    preview={preview}
                    onClose={() =>
                        setPreview(null)
                    }
                    onPrevious={() =>
                        setPreview(
                            (current) => {
                                if (!current)
                                    return current;

                                const product =
                                    products.find(
                                        (item) =>
                                            item.sku ===
                                            current.sku,
                                    );

                                if (!product)
                                    return null;

                                return {
                                    ...current,
                                    index:
                                        current.index >
                                            0
                                            ? current.index -
                                            1
                                            : product
                                                .imageUrls
                                                .length -
                                            1,
                                };
                            },
                        )
                    }
                    onNext={() =>
                        setPreview(
                            (current) => {
                                if (!current)
                                    return current;

                                const product =
                                    products.find(
                                        (item) =>
                                            item.sku ===
                                            current.sku,
                                    );

                                if (!product)
                                    return null;

                                return {
                                    ...current,
                                    index:
                                        current.index <
                                            product
                                                .imageUrls
                                                .length -
                                            1
                                            ? current.index +
                                            1
                                            : 0,
                                };
                            },
                        )
                    }
                    onRemove={() => {
                        const product =
                            products.find(
                                (item) =>
                                    item.sku ===
                                    preview.sku,
                            );

                        if (!product) return;

                        removeImage(
                            product,
                            preview.index,
                        );
                    }}
                />
            )}
        </div>
    );
}

function ImagePreviewModal({
    products,
    preview,
    onClose,
    onPrevious,
    onNext,
    onRemove,
}: {
    products: BulkProduct[];
    preview: {
        sku: string;
        index: number;
    };
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRemove: () => void;
}) {
    const product = products.find(
        (item) => item.sku === preview.sku,
    );

    if (!product) return null;

    const src =
        product.imageUrls[preview.index];

    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <div
                className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="relative overflow-hidden rounded-xl bg-black">
                    <Image
                        src={src}
                        alt={`${product.title || product.sku} image`}
                        width={1920}
                        height={1080}
                        unoptimized
                        className="max-h-[75vh] max-w-[85vw] object-contain"
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                        aria-label="Close preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onPrevious}
                    >
                        Previous
                    </Button>

                    <span className="min-w-[70px] text-center text-sm text-white">
                        {preview.index + 1} /{" "}
                        {product.imageUrls.length}
                    </span>

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onNext}
                    >
                        Next
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={onRemove}
                    >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    );
}