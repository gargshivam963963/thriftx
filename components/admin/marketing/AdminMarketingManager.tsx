"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    RefreshCw,
    Tag,
    Sparkles,
    Megaphone,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import CouponEditorModal from "@/components/admin/marketing/CouponEditorModal";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/lib/marketing/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FieldDef {
    name: string;
    label: string;
    type:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "toggle"
    | "datetime";
    options?: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    step?: string;
}

interface ResourceConfig {
    type: "coupon" | "offer" | "announcement" | "sale";
    title: string;
    icon: React.ReactNode;
    fields: FieldDef[];
    initial: Record<string, any>;
    summary: (item: any) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource configs
// ─────────────────────────────────────────────────────────────────────────────

const CONFIGS: Record<string, ResourceConfig> = {
    coupon: {
        type: "coupon",
        title: "Coupons",
        icon: <Tag size={18} />,
        fields: [],
        initial: {},
        summary: (c) =>
            `${c.code} — ${c.discountType === "percent"
                ? `${c.discountValue}%`
                : `₹${c.discountValue}`
            } off`,
    },

    offer: {
        type: "offer",
        title: "Offers",
        icon: <Sparkles size={18} />,
        fields: [
            {
                name: "title",
                label: "Title",
                type: "text",
                required: true,
                placeholder: "Buy 2 Get 1 Free",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea",
                placeholder: "Describe the offer",
            },
            {
                name: "type",
                label: "Offer Type",
                type: "select",
                options: [
                    {
                        value: "bogo",
                        label: "BOGO (Buy X Get Y)",
                    },
                    {
                        value: "bundle",
                        label: "Bundle Discount",
                    },
                    {
                        value: "threshold",
                        label: "Spend Threshold",
                    },
                ],
            },
            {
                name: "buyQuantity",
                label: "Buy Quantity",
                type: "number",
                step: "1",
            },
            {
                name: "getQuantity",
                label: "Get Quantity",
                type: "number",
                step: "1",
            },
            {
                name: "minQuantity",
                label: "Min Quantity (bundle)",
                type: "number",
                step: "1",
            },
            {
                name: "bundleDiscountType",
                label: "Bundle Discount Type",
                type: "select",
                options: [
                    {
                        value: "flat",
                        label: "Flat (₹)",
                    },
                    {
                        value: "percent",
                        label: "Percent (%)",
                    },
                ],
            },
            {
                name: "bundleDiscountValue",
                label: "Bundle Discount Value",
                type: "number",
                step: "1",
            },
            {
                name: "thresholdAmount",
                label: "Threshold Amount",
                type: "number",
                step: "1",
            },
            {
                name: "rewardValue",
                label: "Reward Value",
                type: "number",
                step: "1",
            },
            {
                name: "rewardType",
                label: "Reward Type",
                type: "select",
                options: [
                    {
                        value: "percent",
                        label: "Percent (%)",
                    },
                    {
                        value: "flat",
                        label: "Flat (₹)",
                    },
                ],
            },
            {
                name: "category",
                label: "Category",
                type: "text",
                placeholder: "e.g. T-Shirts",
            },
            {
                name: "brand",
                label: "Brand",
                type: "text",
                placeholder: "e.g. Nike",
            },
            {
                name: "priority",
                label: "Priority",
                type: "number",
                step: "1",
            },
            {
                name: "startsAt",
                label: "Starts At",
                type: "datetime",
            },
            {
                name: "endsAt",
                label: "Ends At",
                type: "datetime",
            },
            {
                name: "isActive",
                label: "Active",
                type: "toggle",
            },
        ],
        initial: {
            title: "",
            description: "",
            type: "bundle",
            buyQuantity: 0,
            getQuantity: 0,
            minQuantity: "",
            bundleDiscountType: "percent",
            bundleDiscountValue: "",
            thresholdAmount: "",
            rewardValue: "",
            rewardType: "percent",
            category: "",
            brand: "",
            priority: 0,
            startsAt: "",
            endsAt: "",
            isActive: true,
        },
        summary: (o) => `${o.title} (${o.type.toUpperCase()})`,
    },

    announcement: {
        type: "announcement",
        title: "Announcements",
        icon: <Megaphone size={18} />,
        fields: [
            {
                name: "message",
                label: "Message",
                type: "text",
                required: true,
                placeholder: "Free shipping on orders above ₹999!",
            },
            {
                name: "linkLabel",
                label: "Link Label",
                type: "text",
                placeholder: "Shop now",
            },
            {
                name: "linkHref",
                label: "Link URL",
                type: "text",
                placeholder: "/shop",
            },
            {
                name: "bgColor",
                label: "Background Color",
                type: "text",
                placeholder: "bg-foreground",
            },
            {
                name: "priority",
                label: "Priority",
                type: "number",
                step: "1",
            },
            {
                name: "startsAt",
                label: "Starts At",
                type: "datetime",
            },
            {
                name: "endsAt",
                label: "Ends At",
                type: "datetime",
            },
            {
                name: "isActive",
                label: "Active",
                type: "toggle",
            },
        ],
        initial: {
            message: "",
            linkLabel: "",
            linkHref: "",
            bgColor: "bg-foreground",
            priority: 0,
            startsAt: "",
            endsAt: "",
            isActive: true,
        },
        summary: (a) => a.message,
    },

    sale: {
        type: "sale",
        title: "Sales",
        icon: <Clock size={18} />,
        fields: [
            {
                name: "title",
                label: "Title",
                type: "text",
                required: true,
                placeholder: "Mega Sale Weekend",
            },
            {
                name: "subtitle",
                label: "Subtitle",
                type: "text",
                placeholder: "Up to 60% off",
            },
            {
                name: "couponCode",
                label: "Coupon Code",
                type: "text",
                placeholder: "SALE60",
            },
            {
                name: "discountLabel",
                label: "Discount Label",
                type: "text",
                placeholder: "UP TO 60%",
            },
            {
                name: "startsAt",
                label: "Starts At",
                type: "datetime",
                required: true,
            },
            {
                name: "endsAt",
                label: "Ends At",
                type: "datetime",
                required: true,
            },
            {
                name: "isActive",
                label: "Active",
                type: "toggle",
            },
        ],
        initial: {
            title: "",
            subtitle: "",
            couponCode: "",
            discountLabel: "",
            startsAt: "",
            endsAt: "",
            isActive: true,
        },
        summary: (s) => `${s.title} — ${s.discountLabel || "Sale"}`,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function scheduleStatus(item: {
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
    usedCount?: number;
}): string {
    if (!item.isActive) {
        return "Inactive";
    }

    const now = Date.now();

    if (item.endsAt) {
        const end = new Date(item.endsAt).getTime();

        if (!Number.isNaN(end) && end < now) {
            return "Expired — not shown to customers";
        }
    }

    if (item.startsAt) {
        const start = new Date(item.startsAt).getTime();

        if (!Number.isNaN(start) && start > now) {
            return "Scheduled — not live yet";
        }
    }

    return item.usedCount !== undefined ? "Active" : "Live";
}

function formatDate(value?: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic field
// ─────────────────────────────────────────────────────────────────────────────

function Field({
    field,
    value,
    onChange,
}: {
    field: FieldDef;
    value: any;
    onChange: (value: any) => void;
}) {
    const inputClassName =
        "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-body-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

    if (field.type === "toggle") {
        return (
            <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-border bg-card px-3.5 py-3">
                <span className="text-body-sm font-medium text-foreground">
                    {field.label}
                </span>

                <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(value)}
                    onClick={() => onChange(!value)}
                    className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        value ? "bg-foreground" : "bg-muted",
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                            value
                                ? "translate-x-5"
                                : "translate-x-0.5",
                        )}
                    />
                </button>
            </div>
        );
    }

    if (field.type === "select") {
        return (
            <div>
                <label className="mb-1.5 block text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                    {field.label}
                </label>

                <select
                    className={inputClassName}
                    value={value ?? ""}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                >
                    {field.options?.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <div>
                <label className="mb-1.5 block text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                    {field.label}
                </label>

                <textarea
                    className={cn(
                        inputClassName,
                        "min-h-24 resize-y",
                    )}
                    placeholder={field.placeholder}
                    value={value ?? ""}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                />
            </div>
        );
    }

    return (
        <div>
            <label className="mb-1.5 block text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
                {field.required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </label>

            <input
                type={
                    field.type === "number"
                        ? "number"
                        : field.type === "datetime"
                            ? "datetime-local"
                            : "text"
                }
                step={field.step}
                min={
                    field.type === "number"
                        ? "0"
                        : undefined
                }
                className={inputClassName}
                placeholder={field.placeholder}
                value={value ?? ""}
                onChange={(event) =>
                    onChange(
                        field.type === "number"
                            ? event.target.value
                            : event.target.value,
                    )
                }
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main manager
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminMarketingManager({
    resourceType,
}: {
    resourceType:
    | "coupon"
    | "offer"
    | "announcement"
    | "sale";
}) {
    const config = CONFIGS[resourceType];

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState<Record<string, any>>(
        config.initial,
    );

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(
                "/api/admin/marketing",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: config.type,
                        action: "list",
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to load items",
                );
            }

            setItems(data.items || []);
        } catch (error) {
            console.error(error);
            toast.error(
                resourceType === "coupon"
                    ? "Failed to load coupons"
                    : `Failed to load ${config.title.toLowerCase()}`,
            );
        } finally {
            setLoading(false);
        }
    }, [config.type, config.title, resourceType]);

    useEffect(() => {
        void load();
    }, [load]);

    // ─────────────────────────────────────────────────────────────────────────
    // Coupon create/edit
    // ─────────────────────────────────────────────────────────────────────────

    const openCreate = () => {
        if (resourceType !== "coupon") {
            setForm({ ...config.initial });
        }

        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (item: any) => {
        if (resourceType === "coupon") {
            setEditing(item);
            setShowForm(true);
            return;
        }

        const nextForm: Record<string, any> = {
            ...config.initial,
        };

        for (const field of config.fields) {
            if (item[field.name] !== undefined) {
                nextForm[field.name] = item[field.name];
            }
        }

        setForm(nextForm);
        setEditing(item);
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditing(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Other marketing resources
    // ─────────────────────────────────────────────────────────────────────────

    const saveGenericResource = async () => {
        if (resourceType === "announcement") {
            const href = String(
                form.linkHref ?? "",
            ).trim();

            if (
                href &&
                !/^(\/|https?:\/\/)/i.test(href)
            ) {
                toast.error(
                    "Link URL must start with / or https://",
                );
                return;
            }

            if (
                form.startsAt &&
                form.endsAt &&
                new Date(form.endsAt) <=
                new Date(form.startsAt)
            ) {
                toast.error(
                    "End date must be after the start date",
                );
                return;
            }
        }

        if (resourceType === "sale") {
            if (
                form.startsAt &&
                form.endsAt &&
                new Date(form.endsAt) <=
                new Date(form.startsAt)
            ) {
                toast.error(
                    "End date must be after the start date",
                );
                return;
            }
        }

        if (resourceType === "offer") {
            if (!String(form.title ?? "").trim()) {
                toast.error("Enter an offer title");
                return;
            }
        }

        setSaving(true);

        try {
            const response = await fetch(
                "/api/admin/marketing",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: config.type,
                        action: editing
                            ? "update"
                            : "create",
                        id: editing?.id,
                        data: form,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to save",
                );
            }

            toast.success(
                editing
                    ? "Updated successfully"
                    : "Created successfully",
            );

            setShowForm(false);
            setEditing(null);

            await load();
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            `Delete this ${resourceType}? This cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                "/api/admin/marketing",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: config.type,
                        action: "delete",
                        id,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to delete",
                );
            }

            toast.success("Deleted successfully");

            await load();
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete",
            );
        }
    };

    // Coupon codes already in use (excluding the coupon being edited), so
    // the editor can block an accidental duplicate.
    const takenCodes = useMemo<string[]>(
        () =>
            resourceType === "coupon"
                ? items
                      .filter(
                          (item) =>
                              item?.id !== (editing as { id?: string })?.id,
                      )
                      .map((item) =>
                          String(item?.code ?? "")
                              .trim()
                              .toUpperCase(),
                      )
                : [],
        [items, editing, resourceType],
    );

    const handleCouponSaved = async () => {
        setShowForm(false);
        setEditing(null);
        await load();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                            {config.icon}
                        </div>

                        <div>
                            <h1 className="text-heading-2 font-bold tracking-tight text-foreground">
                                {config.title}
                            </h1>

                            <p className="mt-0.5 text-body-sm text-muted-foreground">
                                Manage your{" "}
                                {config.title.toLowerCase()} and
                                customer promotions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        leftIcon={
                            <RefreshCw
                                size={16}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : undefined
                                }
                            />
                        }
                        onClick={() => void load()}
                        disabled={loading}
                    >
                        Refresh
                    </Button>

                    <Button
                        type="button"
                        size="md"
                        leftIcon={<Plus size={16} />}
                        onClick={openCreate}
                    >
                        Add {config.type}
                    </Button>
                </div>
            </div>

            {/* Coupon editor — compact modal, four fields only */}
            {resourceType === "coupon" && (
                <CouponEditorModal
                    open={showForm}
                    coupon={(editing as Coupon | null) ?? null}
                    takenCodes={takenCodes}
                    onClose={closeForm}
                    onSaved={handleCouponSaved}
                />
            )}

            {/* Generic forms for the other marketing resources */}
            {showForm && resourceType !== "coupon" && (
                <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-heading-4 font-semibold text-foreground">
                                {editing
                                    ? "Edit"
                                    : "New"}{" "}
                                {config.type}
                            </h2>

                            <p className="mt-1 text-body-sm text-muted-foreground">
                                Configure the promotion using the
                                existing marketing rules.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={closeForm}
                        >
                            Cancel
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {config.fields.map((field) => (
                            <Field
                                key={field.name}
                                field={field}
                                value={form[field.name]}
                                onChange={(value) =>
                                    setForm(
                                        (current) => ({
                                            ...current,
                                            [field.name]:
                                                value,
                                        }),
                                    )
                                }
                            />
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            type="button"
                            size="md"
                            leftIcon={
                                saving ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Plus size={16} />
                                )
                            }
                            onClick={() =>
                                void saveGenericResource()
                            }
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editing
                                    ? "Save Changes"
                                    : "Create"}
                        </Button>
                    </div>
                </section>
            )}

            {/* Loading */}
            {loading ? (
                <div
                    className="space-y-3"
                    role="status"
                    aria-live="polite"
                    aria-label={`Loading ${config.title.toLowerCase()}`}
                >
                    <span className="sr-only">
                        Loading{" "}
                        {config.title.toLowerCase()}...
                    </span>

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-20 animate-pulse rounded-2xl border border-border bg-muted"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        {config.icon}
                    </div>

                    <h2 className="mt-4 text-heading-4 font-semibold text-foreground">
                        No {config.title.toLowerCase()} yet
                    </h2>

                    <p className="mx-auto mt-1.5 max-w-md text-body-sm text-muted-foreground">
                        Create your first{" "}
                        {config.type} to make it available to
                        customers.
                    </p>

                    <div className="mt-5">
                        <Button
                            type="button"
                            size="md"
                            leftIcon={<Plus size={16} />}
                            onClick={openCreate}
                        >
                            Add {config.type}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => {
                        const status =
                            scheduleStatus(item);

                        const isCoupon =
                            resourceType ===
                            "coupon";

                        return (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/40 sm:p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                            {config.icon}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-body-sm font-semibold text-foreground">
                                                {config.summary(
                                                    item,
                                                )}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
                                                <span>
                                                    {status}
                                                </span>

                                                {isCoupon &&
                                                    item.minOrderValue >
                                                    0 && (
                                                        <>
                                                            <span aria-hidden="true">
                                                                •
                                                            </span>

                                                            <span>
                                                                Min ₹
                                                                {
                                                                    item.minOrderValue
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                {isCoupon &&
                                                    item.expiresAt && (
                                                        <>
                                                            <span aria-hidden="true">
                                                                •
                                                            </span>

                                                            <span>
                                                                Ends{" "}
                                                                {formatDate(
                                                                    item.expiresAt,
                                                                )}
                                                            </span>
                                                        </>
                                                    )}

                                                {item.usedCount !==
                                                    undefined && (
                                                        <>
                                                            <span aria-hidden="true">
                                                                •
                                                            </span>

                                                            <span>
                                                                {
                                                                    item.usedCount
                                                                }{" "}
                                                                used
                                                            </span>
                                                        </>
                                                    )}
                                            </div>

                                            {isCoupon &&
                                                item.description && (
                                                    <p className="mt-1 text-caption text-muted-foreground">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            leftIcon={
                                                <Pencil
                                                    size={
                                                        14
                                                    }
                                                />
                                            }
                                            onClick={() =>
                                                openEdit(
                                                    item,
                                                )
                                            }
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            aria-label={`Delete ${config.type}`}
                                            onClick={() =>
                                                void handleDelete(
                                                    item.id,
                                                )
                                            }
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2
                                                size={15}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}