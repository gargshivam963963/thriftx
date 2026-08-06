"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ShoppingCart,
    Trash2,
    ChevronDown,
    ArrowUpDown,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    Clock,
    Rocket,
    ExternalLink,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/lib/services/adminService";
import { shipOrder } from "@/lib/shipping/admin";
import type { Order } from "@/lib/types/order";
import { toast } from "sonner";

const ORDER_STATUSES = [
    "Pending (COD)",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const STATUS_STYLES: Record<string, string> = {
    "Pending (COD)": "status-badge-pending",
    "Pending": "status-badge-pending",
    "Processing": "status-badge-processing",
    "Shipped": "status-badge-shipped",
    "Delivered": "status-badge-delivered",
    "Cancelled": "status-badge-cancelled",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    "Pending (COD)": <Clock size={12} />,
    "Pending": <Clock size={12} />,
    "Processing": <RefreshCw size={12} />,
    "Shipped": <Truck size={12} />,
    "Delivered": <CheckCircle size={12} />,
    "Cancelled": <XCircle size={12} />,
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [shippingId, setShippingId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [loadOrders]);

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
                    o.phone.includes(q) ||
                    o.orderId.toLowerCase().includes(q) ||
                    o.$id.toLowerCase().includes(q) ||
                    o.city.toLowerCase().includes(q),
            );
        }

        return result;
    }, [orders, search, statusFilter]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const success = await updateOrderStatus(orderId, newStatus);
            if (success) {
                setOrders((prev) =>
                    prev.map((o) => (o.$id === orderId ? { ...o, status: newStatus } : o)),
                );
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                toast.error("Failed to update order status");
            }
        } catch {
            toast.error("Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        try {
            const success = await deleteOrder(orderId);
            if (success) {
                setOrders((prev) => prev.filter((o) => o.$id !== orderId));
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
                // Refresh order list to show new shipping fields
                const data = await getAllOrders();
                setOrders(data);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Orders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {orders.length} total orders •{" "}
                        {orders.filter((o) => o.status === "Delivered").length} delivered
                    </p>
                </div>
                <button
                    onClick={async () => {
                        setLoading(true);
                        try {
                            const data = await getAllOrders();
                            setOrders(data);
                        } catch (error) {
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search by name, phone, order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["all", ...ORDER_STATUSES].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                statusFilter === status
                                    ? "bg-accent text-white dark:bg-white dark:text-black"
                                    : "border border-border text-muted-foreground hover:bg-muted",
                            )}
                        >
                            {status === "all" ? "All" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="admin-card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Order ID
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <ShoppingCart size={32} className="mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {search || statusFilter !== "all"
                                                ? "No orders match your filters"
                                                : "No orders found"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.$id}
                                        className="border-b border-border transition-all hover:bg-muted cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs font-semibold text-foreground">
                                                #{order.orderId?.slice(0, 8).toUpperCase() || order.$id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-foreground">
                                                {order.firstName} {order.lastName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {order.phone}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-foreground">
                                                ₹{order.total.toLocaleString("en-IN")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "status-badge",
                                                    STATUS_STYLES[order.status] || "status-badge-pending",
                                                )}
                                            >
                                                {STATUS_ICONS[order.status] || null}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(order.$createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <select
                                                    value={order.status}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleStatusUpdate(order.$id, e.target.value)}
                                                    disabled={updatingId === order.$id}
                                                    className="rounded-lg border border-border bg-card px-2 py-1.5 text-[10px] font-medium text-foreground outline-none"
                                                >
                                                    {ORDER_STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>

                                                {!order.awbNumber ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShipOrder(order);
                                                        }}
                                                        disabled={shippingId === order.$id}
                                                        title="Create Shiprocket shipment"
                                                        className="flex items-center gap-1 rounded-lg bg-foreground px-2 py-1.5 text-[10px] font-semibold text-white transition-all hover:bg-muted disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-muted"
                                                    >
                                                        {shippingId === order.$id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <Rocket size={12} />
                                                        )}
                                                        Ship
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={order.trackingUrl || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="AWB: {order.awbNumber}"
                                                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    >
                                                        <ExternalLink size={12} />
                                                        AWB
                                                    </a>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteOrder(order.$id);
                                                    }}
                                                    className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Order #{selectedOrder.orderId?.slice(0, 8).toUpperCase() || selectedOrder.$id.slice(0, 8).toUpperCase()}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(selectedOrder.$createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    "status-badge",
                                    STATUS_STYLES[selectedOrder.status] || "status-badge-pending",
                                )}
                            >
                                {selectedOrder.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Customer Details
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {selectedOrder.firstName} {selectedOrder.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedOrder.phone}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Shipping Address
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                    {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.postalCode}
                                </p>
                            </div>

                            {selectedOrder.awbNumber && (
                                <div className="rounded-xl border border-border bg-muted p-3">
                                    <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                        Shipment (Shiprocket)
                                    </p>
                                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                        <p>
                                            Courier:{" "}
                                            <span className="font-semibold text-foreground">
                                                {selectedOrder.courier || "—"}
                                            </span>
                                        </p>
                                        <p>
                                            AWB:{" "}
                                            <span className="font-mono font-semibold text-foreground">
                                                {selectedOrder.awbNumber}
                                            </span>
                                        </p>
                                        {selectedOrder.estimatedDelivery && (
                                            <p>
                                                ETA:{" "}
                                                <span className="font-semibold text-foreground">
                                                    {selectedOrder.estimatedDelivery}
                                                </span>
                                            </p>
                                        )}
                                        {selectedOrder.trackingUrl && (
                                            <a
                                                href={selectedOrder.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                                            >
                                                <ExternalLink size={12} />
                                                Track shipment
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Payment
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {selectedOrder.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
                                </p>
                                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                    <p>Subtotal: ₹{selectedOrder.subtotal.toLocaleString("en-IN")}</p>
                                    <p>Shipping: ₹{selectedOrder.shipping.toLocaleString("en-IN")}</p>
                                    <p className="font-bold text-foreground">
                                        Total: ₹{selectedOrder.total.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

