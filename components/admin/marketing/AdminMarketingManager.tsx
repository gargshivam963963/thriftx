"use client";

import { useEffect, useState, useCallback } from "react";
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
import { cn } from "@/lib/utils";

// ─── Generic field descriptors ───────────────────────────────────────────────

interface FieldDef {
    name: string;
    label: string;
    type: "text" | "number" | "select" | "textarea" | "toggle" | "datetime";
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

// ─── Resource configs ────────────────────────────────────────────────────────

const CONFIGS: Record<string, ResourceConfig> = {
    coupon: {
        type: "coupon",
        title: "Coupons",
        icon: <Tag size={18} />,
        fields: [
            { name: "code", label: "Code", type: "text", required: true, placeholder: "WELCOME10" },
            { name: "description", label: "Description", type: "text", placeholder: "10% off your first order" },
            {
                name: "discountType",
                label: "Discount Type",
                type: "select",
                options: [
                    { value: "flat", label: "Flat (₹)" },
                    { value: "percent", label: "Percent (%)" },
                ],
            },
            { name: "discountValue", label: "Discount Value", type: "number", required: true, step: "1" },
            { name: "minOrderValue", label: "Min Order Value", type: "number", step: "1" },
            { name: "maxDiscount", label: "Max Discount (for %)", type: "number", step: "1" },
            { name: "usageLimit", label: "Usage Limit", type: "number", step: "1" },
            { name: "expiresAt", label: "Expires At", type: "datetime" },
            { name: "isActive", label: "Active", type: "toggle" },
        ],
        initial: {
            code: "",
            description: "",
            discountType: "flat",
            discountValue: 0,
            minOrderValue: 0,
            maxDiscount: "",
            usageLimit: "",
            expiresAt: "",
            isActive: true,
        },
        summary: (c) => `${c.code} — ${c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`} off`,
    },
    offer: {
        type: "offer",
        title: "Offers",
        icon: <Sparkles size={18} />,
        fields: [
            { name: "title", label: "Title", type: "text", required: true, placeholder: "Buy 2 Get 1 Free" },
            { name: "description", label: "Description", type: "textarea", placeholder: "Describe the offer" },
            {
                name: "type",
                label: "Offer Type",
                type: "select",
                options: [
                    { value: "bogo", label: "BOGO (Buy X Get Y)" },
                    { value: "bundle", label: "Bundle Discount" },
                    { value: "threshold", label: "Spend Threshold" },
                ],
            },
            { name: "buyQuantity", label: "Buy Quantity", type: "number", step: "1" },
            { name: "getQuantity", label: "Get Quantity", type: "number", step: "1" },
            { name: "minQuantity", label: "Min Quantity (bundle)", type: "number", step: "1" },
            {
                name: "bundleDiscountType",
                label: "Bundle Discount Type",
                type: "select",
                options: [
                    { value: "flat", label: "Flat (₹)" },
                    { value: "percent", label: "Percent (%)" },
                ],
            },
            { name: "bundleDiscountValue", label: "Bundle Discount Value", type: "number", step: "1" },
            { name: "thresholdAmount", label: "Threshold Amount", type: "number", step: "1" },
            { name: "rewardValue", label: "Reward Value", type: "number", step: "1" },
            {
                name: "rewardType",
                label: "Reward Type",
                type: "select",
                options: [
                    { value: "percent", label: "Percent (%)" },
                    { value: "flat", label: "Flat (₹)" },
                ],
            },
            { name: "category", label: "Category", type: "text", placeholder: "e.g. T-Shirts" },
            { name: "brand", label: "Brand", type: "text", placeholder: "e.g. Nike" },
            { name: "priority", label: "Priority", type: "number", step: "1" },
            { name: "startsAt", label: "Starts At", type: "datetime" },
            { name: "endsAt", label: "Ends At", type: "datetime" },
            { name: "isActive", label: "Active", type: "toggle" },
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
            { name: "message", label: "Message", type: "text", required: true, placeholder: "Free shipping on orders above ₹999!" },
            { name: "linkLabel", label: "Link Label", type: "text", placeholder: "Shop now" },
            { name: "linkHref", label: "Link URL", type: "text", placeholder: "/shop" },
            { name: "bgColor", label: "Background Color", type: "text", placeholder: "bg-foreground" },
            { name: "priority", label: "Priority", type: "number", step: "1" },
            { name: "startsAt", label: "Starts At", type: "datetime" },
            { name: "endsAt", label: "Ends At", type: "datetime" },
            { name: "isActive", label: "Active", type: "toggle" },
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
            { name: "title", label: "Title", type: "text", required: true, placeholder: "Mega Sale Weekend" },
            { name: "subtitle", label: "Subtitle", type: "text", placeholder: "Up to 60% off" },
            { name: "couponCode", label: "Coupon Code", type: "text", placeholder: "SALE60" },
            { name: "discountLabel", label: "Discount Label", type: "text", placeholder: "UP TO 60%" },
            { name: "startsAt", label: "Starts At", type: "datetime", required: true },
            { name: "endsAt", label: "Ends At", type: "datetime", required: true },
            { name: "isActive", label: "Active", type: "toggle" },
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

// ─── Small building blocks ───────────────────────────────────────────────────

function Field({
    field,
    value,
    onChange,
}: {
    field: FieldDef;
    value: any;
    onChange: (val: any) => void;
}) {
    const base =
        "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-border dark:border-border dark:bg-card dark:text-foreground dark:focus:border-border";

    if (field.type === "toggle") {
        return (
            <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                    {field.label}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        value ? "bg-foreground" : "bg-muted-foreground/40 dark:bg-muted",
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                            value ? "left-[22px]" : "left-0.5",
                        )}
                    />
                </button>
            </label>
        );
    }

    if (field.type === "select") {
        return (
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {field.label}
                </label>
                <select
                    className={base}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {field.label}
                </label>
                <textarea
                    className={cn(base, "min-h-[60px]")}
                    placeholder={field.placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    }

    if (field.type === "datetime") {
        return (
            <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {field.label}
                </label>
                <input
                    type="datetime-local"
                    className={base}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    }

    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {field.label}
            </label>
            <input
                type={field.type === "number" ? "number" : "text"}
                step={field.step}
                className={base}
                placeholder={field.placeholder}
                value={value ?? ""}
                onChange={(e) =>
                    onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
                }
            />
        </div>
    );
}

// ─── Main manager ────────────────────────────────────────────────────────────

export default function AdminMarketingManager({
    resourceType,
}: {
    resourceType: "coupon" | "offer" | "announcement" | "sale";
}) {
    const config = CONFIGS[resourceType];
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Record<string, any>>(config.initial);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/marketing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: config.type, action: "list" }),
            });
            const data = await res.json();
            if (data.success) setItems(data.items || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    }, [config.type]);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setForm(config.initial);
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (item: any) => {
        const f: Record<string, any> = { ...config.initial };
        for (const field of config.fields) {
            if (item[field.name] !== undefined) f[field.name] = item[field.name];
        }
        setForm(f);
        setEditing(item);
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/marketing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: config.type,
                    action: editing ? "update" : "create",
                    id: editing?.id,
                    data: form,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editing ? "Updated successfully" : "Created successfully");
                setShowForm(false);
                await load();
            } else {
                toast.error(data.message || "Failed to save");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch("/api/admin/marketing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: config.type,
                    action: "delete",
                    id,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Deleted successfully");
                await load();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {config.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your {config.title.toLowerCase()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="md" leftIcon={<RefreshCw size={16} />} onClick={load}>
                        Refresh
                    </Button>
                    <Button size="md" leftIcon={<Plus size={16} />} onClick={openCreate}>
                        Add {config.type}
                    </Button>
                </div>
            </div>

            {/* Create/Edit form */}
            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">
                            {editing ? "Edit" : "New"} {config.type}
                        </h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {config.fields.map((field) => (
                            <Field
                                key={field.name}
                                field={field}
                                value={form[field.name]}
                                onChange={(val) => setForm((f) => ({ ...f, [field.name]: val }))}
                            />
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            size="lg"
                            leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                        </Button>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        No {config.title.toLowerCase()} yet. Create your first one!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    {config.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {config.summary(item)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.isActive ? "Active" : "Inactive"}
                                        {item.usedCount !== undefined && ` • ${item.usedCount} used`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <button
                                    onClick={() => openEdit(item)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
