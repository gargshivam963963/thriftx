"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import {
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  GENDER_OPTIONS,
} from "@/app/lib/bulk/validators";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Glass, LiquidOrbs } from "@/components/ui/Glass";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";

const MAX_IMAGES = 10;

const STATUS_STYLE: Record<BulkProduct["status"], string> = {
  Ready:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Missing Images":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Invalid: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Uploading: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Uploaded:
    "bg-foreground text-background dark:bg-background dark:text-foreground",
};

function measurementSummary(product: BulkProduct): string {
  const bits: string[] = [];
  if (product.chest) bits.push(`C ${product.chest}`);
  if (product.waist) bits.push(`W ${product.waist}`);
  if (product.length) bits.push(`L ${product.length}`);
  return bits.join(" · ");
}

interface CellInputProps {
  value: string | number | undefined;
  placeholder?: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

function CellInput({
  value,
  placeholder,
  type = "text",
  onChange,
  className,
  ariaLabel,
}: CellInputProps) {
  return (
    <Input
      aria-label={ariaLabel}
      value={value === undefined ? "" : String(value)}
      placeholder={placeholder}
      type={type}
      inputMode={type === "number" ? "decimal" : undefined}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-8 min-w-0 border-transparent bg-transparent px-2 shadow-none",
        "placeholder:text-muted-foreground/70",
        "hover:bg-white/60 focus:border-border focus:bg-white/90",
        "dark:hover:bg-white/10 dark:focus:bg-white/10",
        className
      )}
    />
  );
}

interface FieldSelectProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

function FieldSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
  ariaLabel,
}: FieldSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-8 w-full appearance-none rounded-lg border border-border bg-background",
        "px-2 text-xs outline-none transition focus:border-foreground",
        "focus:ring-2 focus:ring-foreground/10",
        className
      )}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function StatusPill({
  status,
  busy,
}: {
  status: BulkProduct["status"];
  busy?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        "text-[11px] font-semibold whitespace-nowrap",
        STATUS_STYLE[status]
      )}
    >
      {busy ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
      {busy ? "Creating…" : status}
    </span>
  );
}

function InspectorField({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {hint ? (
          <span className="ml-1.5 font-normal normal-case tracking-normal opacity-70">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  review,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  className?: string;
  review?: boolean;
}) {
  return (
    <InspectorField label={label}>
      <Input
        type={type}
        value={value === undefined ? "" : String(value)}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-9",
          review &&
            "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/30",
          className
        )}
      />
    </InspectorField>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  review,
  className,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  review?: boolean;
  className?: string;
}) {
  return (
    <InspectorField label={label}>
      <FieldSelect
        value={value}
        options={options}
        onChange={onChange}
        className={cn(
          "h-9",
          review &&
            "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/30",
          className
        )}
      />
    </InspectorField>
  );
}

interface Props {
  products: BulkProduct[];
  onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
  onAddRow: () => void;
  onAddRows?: (count: number) => void;
  onDeleteRow: (sku: string) => void;
  onDuplicateRow: (sku: string) => void;
  onImagesChange: (sku: string, files: File[]) => void;
  onAiFill: (sku: string) => void;
  aiLoadingSku?: string | null;
  aiLoadingSkus?: string[];
  onUpload: () => void;
  uploading: boolean;
  bulkAiLoading?: boolean;
  onAiFillAll?: () => void;
  onFilesSelected?: (files: File[]) => void;
  onFolderSelected?: (files: File[]) => void;
  aiProcessing?: boolean;
  aiProcessingInfo?: {
    current: number;
    total: number;
    currentSku: string;
  } | null;
  creatingSkus?: string[];
  onCreateRow?: (sku: string) => void;
  coverSkus?: string[];
  onGenerateCover?: (sku: string) => void;
  pendingImageSku?: string | null;
  onPendingImageConsumed?: () => void;
  loading?: boolean;
}

export default function BulkWorkspace({
  products,
  onUpdate,
  onAddRow,
  onAddRows,
  onDeleteRow,
  onDuplicateRow,
  onImagesChange,
  onAiFill,
  aiLoadingSku = null,
  aiLoadingSkus = [],
  onUpload,
  uploading,
  bulkAiLoading = false,
  onAiFillAll,
  onFilesSelected,
  onFolderSelected,
  aiProcessing = false,
  aiProcessingInfo = null,
  creatingSkus = [],
  onCreateRow,
  coverSkus = [],
  onGenerateCover,
  pendingImageSku = null,
  onPendingImageConsumed,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    sku: string;
    index: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const imageInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const folderInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const creatingSet = useMemo(() => new Set(creatingSkus), [creatingSkus]);
  const coverSet = useMemo(() => new Set(coverSkus), [coverSkus]);
  const aiSet = useMemo(() => {
    const set = new Set(aiLoadingSkus);
    if (aiLoadingSku) set.add(aiLoadingSku);
    return set;
  }, [aiLoadingSku, aiLoadingSkus]);

  const readyCount = useMemo(
    () =>
      products.filter(
        (p) => p.status === "Ready" && p.errors.length === 0
      ).length,
    [products]
  );

  const issueCount = useMemo(
    () => products.filter((p) => p.errors.length > 0).length,
    [products]
  );

  const needsReview = useCallback(
    (product: BulkProduct, field: string) =>
      product.aiNeedsReview?.includes(field) ?? false,
    []
  );

  const focusInput = useCallback((sku: string) => {
    imageInputRefs.current.get(sku)?.click();
  }, []);

  const stepPreview = useCallback(
    (delta: number) => {
      setPreview((current) => {
        if (!current) return current;
        const product = products.find((item) => item.sku === current.sku);
        if (!product || !product.imageUrls.length) return null;
        const next =
          (current.index + delta + product.imageUrls.length) %
          product.imageUrls.length;
        return { sku: current.sku, index: next };
      });
    },
    [products]
  );

  useEffect(() => {
    if (!pendingImageSku) return;
    let cancelled = false;
    const attempt = (triesLeft: number) => {
      if (cancelled) return;
      const input = imageInputRefs.current.get(pendingImageSku);
      if (input) {
        input.click();
        onPendingImageConsumed?.();
        return;
      }
      if (triesLeft > 0) window.setTimeout(() => attempt(triesLeft - 1), 60);
      else onPendingImageConsumed?.();
    };
    attempt(4);
    return () => {
      cancelled = true;
    };
  }, [pendingImageSku, onPendingImageConsumed]);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
      else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepPreview(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepPreview(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview, stepPreview]);

  const dispatchFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const hasFolder = files.some((file) =>
        Boolean(
          (file as File & { webkitRelativePath?: string }).webkitRelativePath
        )
      );
      if (hasFolder && onFolderSelected) onFolderSelected(files);
      else onFilesSelected?.(files);
    },
    [onFilesSelected, onFolderSelected]
  );

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatchFiles(Array.from(event.target.files ?? []));
      event.target.value = "";
    },
    [dispatchFiles]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      dispatchFiles(Array.from(event.dataTransfer.files ?? []));
    },
    [dispatchFiles]
  );

  const handleImagesForProduct = useCallback(
    (sku: string, event: ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (!incoming.length) return;
      const product = products.find((item) => item.sku === sku);
      onImagesChange(
        sku,
        [...(product?.imageFiles ?? []), ...incoming].slice(0, MAX_IMAGES)
      );
    },
    [onImagesChange, products]
  );

  const removeImage = useCallback(
    (product: BulkProduct, index: number) => {
      onImagesChange(
        product.sku,
        product.imageFiles.filter((_, i) => i !== index)
      );
      if (index === 0 && product.aiCover) {
        onUpdate(product.sku, { aiCover: false });
      }
      if (preview && preview.sku === product.sku) setPreview(null);
    },
    [onImagesChange, onUpdate, preview]
  );

  return (
    <div className="min-h-screen">
      <div className="relative px-4 pt-6 sm:px-6">
        <Glass className="relative overflow-hidden rounded-[28px] px-5 pt-5 sm:px-6 sm:pt-6">
          <LiquidOrbs className="opacity-60" />
          <div className="relative z-10">
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleInput}
              {...({ webkitdirectory: "", directory: "" } as Record<
                string,
                string
              >)}
            />
            <input
              ref={imagesInputRef}
              type="file"
              multiple
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={handleInput}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="md">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                  {products.length > 0 ? (
                    <span className="ml-2 opacity-70">
                      {readyCount} ready · {issueCount} issues
                    </span>
                  ) : null}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {onAddRows ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddRows(10)}
                  >
                    +10 rows
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddRow}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Single
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imagesInputRef.current?.click()}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Images
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Folder
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={onAiFillAll}
                  disabled={bulkAiLoading || aiProcessing}
                  loading={bulkAiLoading}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI fill all
                </Button>
              </div>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3",
                dragging
                  ? "border-foreground bg-foreground/5"
                  : "border-white/60 bg-white/45 dark:border-white/15 dark:bg-white/[0.05]"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07] text-foreground">
                  <Upload className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {dragging
                      ? "Release to add products"
                      : "Drop product folders or images here"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Each subfolder becomes one product · JPG · PNG · WEBP ·
                    AVIF · HEIC
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onAddRows ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddRows(10)}
                  >
                    +10 blank rows
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddRow}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Blank row
                </Button>
              </div>
            </div>

            {aiProcessing || bulkAiLoading ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-violet-300/40 bg-violet-50/70 px-4 py-2.5 dark:border-violet-500/25 dark:bg-violet-950/30">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600 dark:text-violet-300" />
                <p className="min-w-0 flex-1 truncate text-sm text-violet-800 dark:text-violet-200">
                  {aiProcessingInfo
                    ? `AI analysing ${aiProcessingInfo.current}/${aiProcessingInfo.total} · ${aiProcessingInfo.currentSku}`
                    : "AI is filling in product details"}
                </p>
                <span className="text-xs text-violet-700 dark:text-violet-300">
                  Keep working — nothing is locked
                </span>
              </div>
            ) : null}

            <div className="px-2 pb-1 pt-4 sm:px-3">
              <Table className="min-w-[880px]">
                <TableHeader className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl dark:bg-[#18181b]/90">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[104px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                      Cover
                    </TableHead>
                    <TableHead className="min-w-[260px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                      Product
                    </TableHead>
                    <TableHead className="w-[136px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                      Price
                    </TableHead>
                    <TableHead className="w-[124px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                      Size
                    </TableHead>
                    <TableHead className="w-[152px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="w-[128px] px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center">
                        <FolderOpen className="mx-auto h-7 w-7 text-muted-foreground" />
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          No products yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Drop a product folder, or add a blank row and start
                          typing.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={onAddRow}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add single product
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {products.map((product) => {
                    const isCreating = creatingSet.has(product.sku);
                    const isAiBusy = aiSet.has(product.sku);
                    const isCoverBusy = coverSet.has(product.sku);
                    const isOpen = expanded === product.sku;
                    const hasIssues = product.errors.length > 0;
                    return (
                      <TableRow
                        key={product.sku}
                        className={cn(
                          "align-middle transition-colors",
                          "hover:bg-white/50 dark:hover:bg-white/[0.045]",
                          hasIssues &&
                            !isCreating &&
                            "bg-red-50/70 dark:bg-red-950/25",
                          isCreating && "bg-blue-50/60 dark:bg-blue-950/25"
                        )}
                      >
                        <TableCell className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Preview or add images"
                              onClick={() =>
                                product.imageUrls.length
                                  ? setPreview({ sku: product.sku, index: 0 })
                                  : focusInput(product.sku)
                              }
                              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/70 bg-white/70"
                            >
                              {isCoverBusy ? (
                                <span className="block h-full w-full animate-pulse bg-white/60" />
                              ) : product.imageUrls[0] ? (
                                <Image
                                  src={product.imageUrls[0]}
                                  alt={product.title || product.sku}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <ImageIcon className="h-4 w-4" />
                                </span>
                              )}
                              {product.aiCover ? (
                                <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white">
                                  <Sparkles className="h-2.5 w-2.5" />
                                </span>
                              ) : null}
                            </button>

                            <input
                              ref={(node) => {
                                if (node) {
                                  imageInputRefs.current.set(product.sku, node);
                                } else {
                                  imageInputRefs.current.delete(product.sku);
                                }
                              }}
                              type="file"
                              multiple
                              accept={IMAGE_ACCEPT}
                              className="hidden"
                              onChange={(event) =>
                                handleImagesForProduct(product.sku, event)
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <CellInput
                                  ariaLabel="Product title"
                                  value={product.title}
                                  placeholder="Product title"
                                  onChange={(value) =>
                                    onUpdate(product.sku, { title: value })
                                  }
                                  className="h-7 font-medium"
                                />
                                <CellInput
                                  ariaLabel="Brand"
                                  value={product.brand}
                                  placeholder="Brand"
                                  onChange={(value) =>
                                    onUpdate(product.sku, { brand: value })
                                  }
                                  className="h-7 w-24 text-xs"
                                />
                                <FieldSelect
                                  ariaLabel="Category"
                                  value={product.category}
                                  options={CATEGORY_OPTIONS}
                                  placeholder="Category"
                                  onChange={(value) =>
                                    onUpdate(product.sku, { category: value })
                                  }
                                  className="h-7 min-w-0 flex-1 px-1.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-3 py-2">
                          <CellInput
                            ariaLabel="Selling price"
                            type="number"
                            value={product.price}
                            placeholder="0"
                            onChange={(value) =>
                              onUpdate(product.sku, {
                                price: Number(value) || 0,
                              })
                            }
                            className="h-7 font-semibold"
                          />
                          <p className="mt-0.5 px-2 text-xs text-muted-foreground">
                            MRP{" "}
                            {product.retailPrice
                              ? `Rs.${product.retailPrice}`
                              : "—"}
                          </p>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <CellInput
                            ariaLabel="Size"
                            value={product.size}
                            placeholder="M"
                            onChange={(value) =>
                              onUpdate(product.sku, { size: value })
                            }
                            className="h-7 font-semibold uppercase"
                          />
                          <p className="mt-0.5 px-2 text-xs text-muted-foreground">
                            {measurementSummary(product) || "—"}
                          </p>
                        </TableCell>

                        <TableCell className="px-3 py-2">
                          <div className="flex flex-col items-start gap-1">
                            <StatusPill
                              status={product.status}
                              busy={isCreating}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded(isOpen ? null : product.sku)
                              }
                              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                            >
                              {hasIssues ? (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              ) : product.status === "Uploaded" ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : null}
                              {hasIssues
                                ? `${product.errors.length} issue${
                                    product.errors.length === 1 ? "" : "s"
                                  }`
                                : "Details"}
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="iconXs"
                              title="AI fill details"
                              disabled={
                                isAiBusy ||
                                product.status === "Uploaded" ||
                                product.imageFiles.length === 0
                              }
                              onClick={() => onAiFill(product.sku)}
                            >
                              {isAiBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="iconXs"
                              title="Generate main cover"
                              disabled={
                                isCoverBusy ||
                                product.imageFiles.length === 0
                              }
                              onClick={() => onGenerateCover?.(product.sku)}
                            >
                              {isCoverBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : product.aiCover ? (
                                <RefreshCw className="h-3.5 w-3.5" />
                              ) : (
                                <Wand2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="iconXs"
                              title="Create this product now"
                              disabled={
                                isCreating ||
                                product.status === "Uploaded" ||
                                product.status !== "Ready" ||
                                product.errors.length > 0
                              }
                              onClick={() => onCreateRow?.(product.sku)}
                            >
                              {isCreating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : product.status === "Uploaded" ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {products.map((product) => {
              if (expanded !== product.sku) return null;
              const hasIssues = product.errors.length > 0;
              return (
                <div
                  key={product.sku}
                  className="mt-3 rounded-2xl border border-white/60 bg-white/45 px-4 py-4 dark:border-white/15 dark:bg-white/[0.035]"
                >
                  {hasIssues ? (
                    <ul className="mb-3 flex flex-wrap gap-1.5">
                      {product.errors.map((error) => (
                        <li
                          key={error}
                          className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        >
                          {error}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <InspectorField label="SKU">
                      <CellInput
                        ariaLabel="SKU"
                        value={product.sku}
                        onChange={(value) =>
                          onUpdate(product.sku, { sku: value })
                        }
                        className="h-9 border-border bg-background font-mono text-xs"
                      />
                    </InspectorField>
                    <SelectField
                      label="Gender"
                      value={product.gender}
                      options={GENDER_OPTIONS}
                      onChange={(value) =>
                        onUpdate(product.sku, {
                          gender: value as BulkProduct["gender"],
                        })
                      }
                    />
                    <SelectField
                      label="Condition"
                      value={product.condition}
                      options={CONDITION_OPTIONS}
                      review={needsReview(product, "condition")}
                      onChange={(value) =>
                        onUpdate(product.sku, { condition: value })
                      }
                    />
                    <TextField
                      label="Title"
                      value={product.title}
                      placeholder="Product title"
                      review={needsReview(product, "title")}
                      onChange={(value) =>
                        onUpdate(product.sku, { title: value })
                      }
                      className="sm:col-span-2"
                    />
                    <TextField
                      label="Brand"
                      value={product.brand}
                      placeholder="Brand"
                      review={needsReview(product, "brand")}
                      onChange={(value) =>
                        onUpdate(product.sku, { brand: value })
                      }
                    />
                    <TextField
                      label="Slug"
                      value={product.slug}
                      placeholder="URL slug"
                      onChange={(value) =>
                        onUpdate(product.sku, { slug: value })
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <TextField
                      label="MRP"
                      type="number"
                      value={product.retailPrice}
                      placeholder="999"
                      onChange={(value) =>
                        onUpdate(product.sku, {
                          retailPrice: Number(value) || undefined,
                        })
                      }
                    />
                    <TextField
                      label="Chest (cm)"
                      value={product.chest}
                      placeholder="96"
                      onChange={(value) =>
                        onUpdate(product.sku, { chest: value })
                      }
                    />
                    <TextField
                      label="Waist (cm)"
                      value={product.waist}
                      placeholder="78"
                      onChange={(value) =>
                        onUpdate(product.sku, { waist: value })
                      }
                    />
                    <TextField
                      label="Length (cm)"
                      value={product.length}
                      placeholder="68"
                      onChange={(value) =>
                        onUpdate(product.sku, { length: value })
                      }
                    />
                    <TextField
                      label="Colour"
                      value={product.color}
                      placeholder="Colour"
                      onChange={(value) =>
                        onUpdate(product.sku, { color: value })
                      }
                    />
                    <TextField
                      label="Material"
                      value={product.material}
                      placeholder="Material"
                      review={needsReview(product, "material")}
                      onChange={(value) =>
                        onUpdate(product.sku, { material: value })
                      }
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <InspectorField label="Description">
                      <textarea
                        value={product.description ?? ""}
                        placeholder="Description"
                        onChange={(event) =>
                          onUpdate(product.sku, {
                            description: event.target.value,
                          })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none transition focus:border-foreground"
                      />
                    </InspectorField>
                    <InspectorField label="Shipping info">
                      <textarea
                        value={product.shippingInfo ?? ""}
                        placeholder="Shipping info"
                        onChange={(event) =>
                          onUpdate(product.sku, {
                            shippingInfo: event.target.value,
                          })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none transition focus:border-foreground"
                      />
                    </InspectorField>
                  </div>
                  {product.imageUrls.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.imageUrls.map((url, i) => (
                        <div key={`${url}-${i}`} className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setPreview({ sku: product.sku, index: i })
                            }
                            className={cn(
                              "block h-16 w-16 overflow-hidden rounded-xl border",
                              "border-white/60 bg-white/80",
                              i === 0 &&
                                "border-foreground ring-2 ring-foreground/30"
                            )}
                          >
                            <Image
                              src={url}
                              alt={`${product.sku} ${i + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove image ${i + 1}`}
                            onClick={() => removeImage(product, i)}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicateRow(product.sku)}
                    >
                      Duplicate row
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRow(product.sku)}
                    >
                      Delete row
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Glass>
      </div>

      {preview ? (
        <PreviewLightbox
          preview={preview}
          products={products}
          onClose={() => setPreview(null)}
          onStep={stepPreview}
          onSelect={(index) => setPreview({ sku: preview.sku, index })}
        />
      ) : null}
    </div>
  );
}

function PreviewLightbox({
  preview,
  products,
  onClose,
  onStep,
  onSelect,
}: {
  preview: { sku: string; index: number };
  products: BulkProduct[];
  onClose: () => void;
  onStep: (delta: number) => void;
  onSelect: (index: number) => void;
}) {
  const product = products.find((p) => p.sku === preview.sku);
  const urls = product?.imageUrls ?? [];
  const url = urls[preview.index];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-[#18181b]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3">
          <h3 className="text-sm font-semibold text-foreground">
            Preview · {preview.sku}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => onStep(-1)}
            disabled={preview.index === 0}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-xl bg-muted">
            {url ? (
              <Image
                src={url}
                alt="preview"
                fill
                unoptimized
                className="object-contain"
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onStep(1)}
            disabled={preview.index >= urls.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {urls.map((thumb, i) => (
            <button
              key={`${thumb}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border",
                "border-border bg-muted",
                i === preview.index &&
                  "border-foreground ring-2 ring-foreground/30"
              )}
            >
              <Image
                src={thumb}
                alt={`${preview.sku} ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {product?.title || "Untitled"}
          </p>
          <p className="text-xs text-muted-foreground">SKU: {preview.sku}</p>
        </div>
      </div>
    </div>
  );
}
