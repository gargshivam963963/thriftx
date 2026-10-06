"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ShoppingCart,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Truck,
    Clock,
    Rocket,
    ExternalLink,
    Loader2,
    Copy,
    Check,
    X,
    Phone,
    MapPin,
    CreditCard,
    Package,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedFilterRow } from "@/components/ui/SegmentedControl";
import PageHeader from "@/components/ui/PageHeader";
import AdminPage from "@/components/admin/AdminPage";
import PremiumImage from "@/components/ui/PremiumImage";
import { cn } from "@/lib/utils";
import { shipOrder } from "@/lib/shipping/admin";
import type { Order } from "@/lib/types/order";
import { toast } from "sonner";

async function apiGetAllOrders(): Promise<Order[]> {
    const res = await fetch("/api/admin/orders");
    if (!res.ok) return [];
    const json = await res.json();
    return json?.orders ?? [];
}

async function apiUpdateOrderStatus(id: string, status: string): Promise<boolean> {
    const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json?.success === true;
}

async function apiUpdateOrderDetails(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json?.success === true;
}

async function apiDeleteOrder(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json?.success === true;
}

const ORDER_STATUSES = [
    "Pending (COD)",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
] as const;

function getStatusBadge(status: string) {
    switch (status) {
        case "Delivered":
            return {
                icon: CheckCircle2,
                className:
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            };
        case "Shipped":
            return {
                icon: Truck,
                className:
                    "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
            };
        case "Processing":
            return {
                icon: RefreshCw,
                className:
                    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
            };
        case "Cancelled":
            return {
                icon: XCircle,
                className:
                    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
            };
        case "Pending (COD)":
        case "Pending":
        default:
            return {
                icon: Clock,
                className:
                    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
            };
    }
}

interface ParsedProduct {
    id: string;
    title: string;
    price: number;
    size?: string;
    images?: string[];
    primaryImage?: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [shippingId, setShippingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGetAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        for (const s of ORDER_STATUSES) {
            counts[s] = 0;
        }
        for (const o of orders) {
            if (counts[o.status] !== undefined) {
                counts[o.status] += 1;
            }
        }
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        if (statusFilter !== "all") {
            result = result.filter((o) => o.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (o) =>
                    `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
                    o.phone?.includes(q) ||
                    o.email?.toLowerCase().includes(q) ||
                    o.orderId?.toLowerCase().includes(q) ||
                    o.$id?.toLowerCase().includes(q) ||
                    o.city?.toLowerCase().includes(q),
            );
        }

        return result;
    }, [orders, search, statusFilter]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const success = await apiUpdateOrderStatus(orderId, newStatus);
            if (success) {
                setOrders((prev) =>
                    prev.map((o) => (o.$id === orderId ? { ...o, status: newStatus } : o)),
                );
                if (selectedOrder && selectedOrder.$id === orderId) {
                    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
                }
                toast.success(`Order updated to ${newStatus}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        try {
            const success = await apiDeleteOrder(orderId);
            if (success) {
                setOrders((prev) => prev.filter((o) => o.$id !== orderId));
                if (selectedOrder && selectedOrder.$id === orderId) {
                    setSelectedOrder(null);
                }
                toast.success("Order deleted successfully");
            } else {
                toast.error("Failed to delete order");
            }
        } catch {
            toast.error("Failed to delete order");
        }
    };

    const handleShipOrder = async (order: Order) => {
        if (order.awbNumber) {
            toast.info("Shipment already created for this order.");
            return;
        }
        setShippingId(order.$id);
        try {
            const result = await shipOrder(order.$id);
            if (result.success) {
                toast.success("Shipment created successfully!");
                await loadOrders();
            } else {
                toast.error(result.message || "Failed to create shipment");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to create shipment");
        } finally {
            setShippingId(null);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AdminPage width="wide">
            {/* Header */}
            <PageHeader
                title="Orders"
                description={`${orders.length} total orders • ${orders.filter((o) => o.status === "Delivered").length} delivered • ₹${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString("en-IN")} total revenue`}
                actions={
                    <Button
                        onClick={loadOrders}
                        variant="outline"
                        size="md"
                        disabled={loading}
                        leftIcon={<RefreshCw size={15} className={cn(loading && "animate-spin")} />}
                    >
                        Refresh
                    </Button>
                }
            />

            {/* Filter row */}
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative w-full lg:max-w-md">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search by customer, phone, email, order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search orders"
                        className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-body-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-ring/30 md:h-11"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Status filter — same primitive as every other switch */}
                <SegmentedFilterRow
                    value={statusFilter}
                    onChange={setStatusFilter}
                    ariaLabel="Filter orders by status"
                    idPrefix="admin-orders-status"
                    options={[
                        {
                            value: "all",
                            label: "All",
                            count: statusCounts.all || 0,
                        },
                        ...ORDER_STATUSES.map((status) => ({
                            value: status,
                            label: status,
                            count: statusCounts[status] || 0,
                        })),
                    ]}
                    className="lg:max-w-xl lg:justify-end"
                />
            </div>

            {/* Orders Table Card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Order ID
                                </th>
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Customer
                                </th>
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Contact
                                </th>
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Total
                                </th>
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3.5 text-caption text-muted-foreground">
                                    Date
                                </th>
                                <th className="px-4 py-3.5 text-right text-caption text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className="skeleton-glass h-4 w-full rounded-lg" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <ShoppingCart size={36} className="mx-auto mb-3 text-muted-foreground/60" />
                                        <p className="text-base font-semibold text-foreground">
                                            {search || statusFilter !== "all"
                                                ? "No matching orders found"
                                                : "No orders placed yet"}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {search
                                                ? "Try searching with a different name, phone number, or ID."
                                                : "Orders will appear here once customers checkout."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const badge = getStatusBadge(order.status);
                                    const StatusIcon = badge.icon;
                                    const displayId =
                                        order.orderId ||
                                        `THRIFTX-${(order.$id || "").slice(-8).toUpperCase()}`;

                                    return (
                                        <tr
                                            key={order.$id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="group cursor-pointer transition-colors hover:bg-muted/40"
                                        >
                                            {/* Order ID */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-xs font-semibold text-foreground">
                                                        #{displayId}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(displayId, order.$id);
                                                        }}
                                                        title="Copy order ID"
                                                        className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {copiedId === order.$id ? (
                                                            <Check size={13} className="text-emerald-500" />
                                                        ) : (
                                                            <Copy size={13} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                                                        {(order.firstName || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {order.firstName} {order.lastName}
                                                        </p>
                                                        {order.email && (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {order.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-4 py-3.5">
                                                <div className="text-xs">
                                                    <p className="font-medium text-foreground">{order.phone || "—"}</p>
                                                    <p className="text-muted-foreground">{order.city || "—"}</p>
                                                </div>
                                            </td>

                                            {/* Total */}
                                            <td className="px-4 py-3.5">
                                                <div>
                                                    <span className="font-bold text-sm text-foreground">
                                                        ₹{order.total?.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground uppercase">
                                                        {order.paymentMethod === "cod" ? "COD" : "Prepaid"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-normal",
                                                        badge.className,
                                                    )}
                                                >
                                                    <StatusIcon size={12} className="shrink-0" />
                                                    <span>{order.status}</span>
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                                {order.$createdAt
                                                    ? new Date(order.$createdAt).toLocaleDateString("en-IN", {
                                                          day: "numeric",
                                                          month: "short",
                                                          year: "numeric",
                                                      })
                                                    : "—"}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5 text-right">
                                                <div
                                                    className="inline-flex items-center justify-end gap-1.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Status Dropdown */}
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.$id, e.target.value)}
                                                        disabled={updatingId === order.$id}
                                                        aria-label="Change status"
                                                        className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground outline-none transition-colors focus:ring-1 focus:ring-foreground"
                                                    >
                                                        {ORDER_STATUSES.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Ship Button */}
                                                    {!order.awbNumber ? (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleShipOrder(order)}
                                                            disabled={shippingId === order.$id}
                                                            className="h-8 gap-1.5 px-2.5 text-xs font-semibold"
                                                            title="Create Shiprocket shipment"
                                                        >
                                                            {shippingId === order.$id ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Rocket size={12} />
                                                            )}
                                                            <span>Ship</span>
                                                        </Button>
                                                    ) : (
                                                        <a
                                                            href={order.trackingUrl || "#"}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title={`AWB: ${order.awbNumber}`}
                                                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                        >
                                                            <ExternalLink size={12} />
                                                            <span>AWB</span>
                                                        </a>
                                                    )}

                                                    {/* Delete Button */}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteOrder(order.$id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        title="Delete order"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-border pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground">
                                            Order #{selectedOrder.orderId || selectedOrder.$id.slice(-8).toUpperCase()}
                                        </h3>
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                                                getStatusBadge(selectedOrder.status).className,
                                            )}
                                        >
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Placed on{" "}
                                        {selectedOrder.$createdAt
                                            ? new Date(selectedOrder.$createdAt).toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : "—"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-4 py-4">
                                {/* Customer & Shipping Details */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <Phone size={13} />
                                            <span>Customer Details</span>
                                        </div>
                                        <p className="mt-2 font-semibold text-foreground text-sm">
                                            {selectedOrder.firstName} {selectedOrder.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{selectedOrder.phone}</p>
                                        {selectedOrder.email && (
                                            <p className="text-xs text-muted-foreground">{selectedOrder.email}</p>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            <MapPin size={13} />
                                            <span>Delivery Address</span>
                                        </div>
                                        <p className="mt-2 text-xs text-foreground leading-relaxed">
                                            {selectedOrder.address}
                                            <br />
                                            {selectedOrder.city}, {selectedOrder.state || ""} {selectedOrder.postalCode}
                                            <br />
                                            {selectedOrder.country || "India"}
                                        </p>
                                    </div>
                                </div>

                                {/* Items List (if available in products snapshot) */}
                                {(() => {
                                    let items: ParsedProduct[] = [];
                                    try {
                                        if (selectedOrder.products) {
                                            items = JSON.parse(selectedOrder.products);
                                        }
                                    } catch {}

                                    if (!items.length) return null;

                                    return (
                                        <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                                                <Package size={13} />
                                                <span>Ordered Items ({items.length})</span>
                                            </div>
                                            <div className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <div
                                                        key={item.id || idx}
                                                        className="flex items-center justify-between rounded-lg bg-card p-2.5 border border-border"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {(item.primaryImage || item.images?.[0]) && (
                                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                                                                    <PremiumImage
                                                                        src={item.primaryImage || item.images?.[0] || "/images/placeholder.jpg"}
                                                                        alt={item.title}
                                                                        fill
                                                                        sizes="40px"
                                                                        className="object-cover"
                                                                        fallbackSrc="/images/placeholder.jpg"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-semibold text-foreground line-clamp-1">
                                                                    {item.title}
                                                                </p>
                                                                {item.size && (
                                                                    <p className="text-2xs text-muted-foreground">
                                                                        Size: {item.size}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-xs text-foreground font-mono">
                                                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Shipping / Shiprocket info */}
                                {selectedOrder.awbNumber && (
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            <Truck size={13} />
                                            <span>Shipment Status (Shiprocket)</span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Courier: </span>
                                                <span className="font-semibold text-foreground">{selectedOrder.courier || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">AWB: </span>
                                                <span className="font-mono font-semibold text-foreground">{selectedOrder.awbNumber}</span>
                                            </div>
                                            {selectedOrder.estimatedDelivery && (
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">ETA: </span>
                                                    <span className="font-semibold text-foreground">{selectedOrder.estimatedDelivery}</span>
                                                </div>
                                            )}
                                        </div>
                                        {selectedOrder.trackingUrl && (
                                            <a
                                                href={selectedOrder.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                                            >
                                                <ExternalLink size={13} />
                                                <span>Track Live Shipment</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Return & Refund Management */}
                                {selectedOrder.returnStatus && selectedOrder.returnStatus !== "none" && (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                                <RotateCcw size={13} />
                                                <span>Return Status: {selectedOrder.returnStatus}</span>
                                            </div>
                                            {selectedOrder.returnReason && (
                                                <span className="text-2xs text-muted-foreground truncate max-w-[200px]">
                                                    Reason: {selectedOrder.returnReason}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {selectedOrder.returnStatus === "requested" && (
                                                <>
                                                    <Button
                                                        size="xs"
                                                        variant="primary"
                                                        onClick={async () => {
                                                            await apiUpdateOrderDetails(selectedOrder.$id, { returnStatus: "approved" });
                                                            setOrders((prev) => prev.map((o) => o.$id === selectedOrder.$id ? { ...o, returnStatus: "approved" } : o));
                                                            setSelectedOrder((prev) => prev ? { ...prev, returnStatus: "approved" } : null);
                                                            toast.success("Return approved. Courier pickup scheduled.");
                                                        }}
                                                    >
                                                        Approve Return
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            await apiUpdateOrderDetails(selectedOrder.$id, { returnStatus: "rejected", returnAdminNotes: "Rejected by admin" });
                                                            setOrders((prev) => prev.map((o) => o.$id === selectedOrder.$id ? { ...o, returnStatus: "rejected" } : o));
                                                            setSelectedOrder((prev) => prev ? { ...prev, returnStatus: "rejected" } : null);
                                                            toast.info("Return request rejected.");
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {selectedOrder.returnStatus === "approved" && (
                                                <Button
                                                    size="xs"
                                                    variant="primary"
                                                    onClick={async () => {
                                                        await apiUpdateOrderDetails(selectedOrder.$id, { returnStatus: "item_received" });
                                                        setOrders((prev) => prev.map((o) => o.$id === selectedOrder.$id ? { ...o, returnStatus: "item_received" } : o));
                                                        setSelectedOrder((prev) => prev ? { ...prev, returnStatus: "item_received" } : null);
                                                        toast.success("Item marked received.");
                                                    }}
                                                >
                                                    Mark Item Received
                                                </Button>
                                            )}
                                            {selectedOrder.returnStatus === "item_received" && (
                                                <Button
                                                    size="xs"
                                                    variant="primary"
                                                    onClick={async () => {
                                                        await apiUpdateOrderDetails(selectedOrder.$id, { returnStatus: "refunded", refundStatus: "completed" });
                                                        setOrders((prev) => prev.map((o) => o.$id === selectedOrder.$id ? { ...o, returnStatus: "refunded", refundStatus: "completed" } : o));
                                                        setSelectedOrder((prev) => prev ? { ...prev, returnStatus: "refunded", refundStatus: "completed" } : null);
                                                        toast.success("Return marked refunded & piece restored to inventory.");
                                                    }}
                                                >
                                                    Complete & Issue Refund
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Breakdown */}
                                <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <CreditCard size={13} />
                                        <span>Payment Summary</span>
                                    </div>
                                    <div className="mt-2.5 space-y-1.5 text-xs">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Payment Method</span>
                                            <span className="font-semibold text-foreground uppercase">
                                                {selectedOrder.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery (COD)"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.subtotal?.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Shipping</span>
                                            <span>{selectedOrder.shipping === 0 ? "Free" : `₹${selectedOrder.shipping?.toLocaleString("en-IN")}`}</span>
                                        </div>
                                        {Boolean(selectedOrder.discount) && (
                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                <span>Discount ({selectedOrder.couponCode || "Promo"})</span>
                                                <span>-₹{selectedOrder.discount?.toLocaleString("en-IN")}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold text-foreground">
                                            <span>Total Amount</span>
                                            <span className="font-mono">₹{selectedOrder.total?.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                {!selectedOrder.awbNumber ? (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleShipOrder(selectedOrder)}
                                        disabled={shippingId === selectedOrder.$id}
                                    >
                                        {shippingId === selectedOrder.$id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Rocket size={14} />
                                        )}
                                        <span>Create Shipment</span>
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Shipment dispatched</span>
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminPage>
    );
}
