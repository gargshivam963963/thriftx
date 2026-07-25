"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    CheckCircle2,
    Truck,
    Clock,
    MapPin,
    Phone,
    User,
    CreditCard,
    IndianRupee,
    PackageCheck,
    BadgeCheck,
    XCircle,
    AlertCircle,
    RefreshCw,
    ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getUserOrders } from "@/lib/services/orderService";
import { getDeliveryInfo, formatDeliveryTimeline } from "@/lib/delivery";
import type { Order } from "@/lib/types/order";

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    {
        icon: React.ReactNode;
        label: string;
        color: string;
        bg: string;
    }
> = {
    "Pending (COD)": {
        icon: <Clock size={20} />,
        label: "Pending",
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    Pending: {
        icon: <Clock size={20} />,
        label: "Pending",
        color: "text-amber-600",
        bg: "bg-amber-100",
    },
    Processing: {
        icon: <PackageCheck size={20} />,
        label: "Processing",
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    Shipped: {
        icon: <Truck size={20} />,
        label: "Shipped",
        color: "text-violet-600",
        bg: "bg-violet-100",
    },
    Delivered: {
        icon: <BadgeCheck size={20} />,
        label: "Delivered",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    Cancelled: {
        icon: <XCircle size={20} />,
        label: "Cancelled",
        color: "text-red-600",
        bg: "bg-red-100",
    },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TrackingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-12 w-48 animate-pulse rounded-xl bg-zinc-200" />
            <div className="h-64 animate-pulse rounded-3xl bg-zinc-200" />
            <div className="h-48 animate-pulse rounded-3xl bg-zinc-200" />
        </div>
    );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TrackingTimeline({
    currentStatus,
    steps,
}: {
    currentStatus: string;
    steps: { title: string; subtitle: string }[];
}) {
    const statusOrder = [
        "Pending (COD)",
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div className="space-y-0">
            {steps.map((step, i) => {
                const isCompleted = i <= currentIndex;
                const isCurrent = i === currentIndex;

                return (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.25 }}
                        className="relative flex items-start gap-4 pb-8 last:pb-0"
                    >
                        {/* Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isCompleted
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : isCurrent
                                            ? "bg-zinc-900 text-white ring-4 ring-zinc-900/10"
                                            : "bg-zinc-100 text-zinc-400"
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div
                                    className={`mt-1 h-full w-0.5 ${isCompleted
                                            ? "bg-emerald-200"
                                            : "bg-zinc-200"
                                        }`}
                                />
                            )}
                        </div>

                        <div className="pt-1.5">
                            <h4
                                className={`text-sm font-semibold ${isCurrent
                                        ? "text-zinc-900"
                                        : isCompleted
                                            ? "text-emerald-700"
                                            : "text-zinc-400"
                                    }`}
                            >
                                {step.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-zinc-500">
                                {step.subtitle}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Main Tracking Page ──────────────────────────────────────────────────────

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const documentId = params.id as string;

    const fetchOrder = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const orders = await getUserOrders();
            const found = orders.find((o) => o.$id === documentId);
            if (!found) {
                setError("Order not found.");
                return;
            }
            setOrder(found);
        } catch (err) {
            console.error(err);
            setError("Failed to load order.");
            toast.error("Could not load order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace(`/login?redirect=/orders/${documentId}`);
            return;
        }
        fetchOrder();
    }, [authLoading, user, documentId, router]);

    // ── Render ──

    if (authLoading || (loading && !order)) return <TrackingSkeleton />;

    if (error && !order) {
        return (
            <main className="min-h-screen bg-zinc-50">
                <div className="mx-auto max-w-3xl px-4 py-12 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                    </div>
                    <h1 className="mt-5 font-serif text-xl font-semibold text-zinc-900">
                        {error}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        The order you&apos;re looking for could not be found.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link href="/orders">
                            <Button
                                variant="outline"
                                leftIcon={<ArrowLeft size={16} />}
                                className="rounded-xl"
                            >
                                Back to Orders
                            </Button>
                        </Link>
                        <Button
                            leftIcon={<RefreshCw size={16} />}
                            onClick={fetchOrder}
                            className="rounded-xl"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    if (!order) return null;

    const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["Pending"];
    const deliveryInfo = getDeliveryInfo(order.city, order.postalCode);
    const timeline = formatDeliveryTimeline(deliveryInfo.zone);

    let products: { title: string; price: number; quantity: number; image: string; size: string }[] = [];
    try {
        products = JSON.parse(order.products || "[]");
    } catch { }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/orders"
                        className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-900"
                    >
                        <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                            <ArrowLeft size={14} />
                        </div>
                        All Orders
                    </Link>
                </motion.div>

                <div className="space-y-5">
                    {/* ── Status Hero Card ────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                    >
                        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${statusConfig.bg}`}
                                >
                                    <div className={statusConfig.color}>
                                        {statusConfig.icon}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                        Order Status
                                    </p>
                                    <h2
                                        className={`mt-0.5 text-lg font-bold ${statusConfig.color}`}
                                    >
                                        {statusConfig.label}
                                    </h2>
                                </div>
                            </div>

                            <div className="rounded-xl bg-zinc-100 px-4 py-2 text-right">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Total
                                </p>
                                <p className="font-serif text-lg font-bold text-zinc-900">
                                    ₹{order.total.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="px-6 py-5">
                            <div className="flex items-start gap-4 rounded-2xl bg-amber-50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">
                                    {deliveryInfo.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                                        Estimated Delivery
                                    </p>
                                    <h3 className="mt-0.5 font-serif text-lg font-bold text-amber-900">
                                        {deliveryInfo.label}
                                    </h3>
                                    <p className="mt-0.5 text-sm text-amber-700/80">
                                        {deliveryInfo.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="border-t border-zinc-100 px-6 py-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Tracking Timeline
                            </p>
                            <div className="mt-4">
                                <TrackingTimeline
                                    currentStatus={order.status}
                                    steps={timeline.steps}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Order Details ────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-zinc-100 px-6 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Order Details
                            </p>
                        </div>

                        <div className="divide-y divide-zinc-100 px-6">
                            <DetailRow
                                icon={<User size={16} />}
                                label="Customer"
                                value={`${order.firstName} ${order.lastName}`}
                            />
                            <DetailRow
                                icon={<Phone size={16} />}
                                label="Phone"
                                value={order.phone}
                            />
                            <DetailRow
                                icon={<MapPin size={16} />}
                                label="Delivery Address"
                                value={`${order.address}, ${order.city}, ${order.postalCode}`}
                            />
                            <DetailRow
                                icon={<CreditCard size={16} />}
                                label="Payment"
                                value={
                                    order.paymentMethod === "cod"
                                        ? "Cash on Delivery"
                                        : "Online (Razorpay)"
                                }
                            />
                        </div>
                    </motion.div>

                    {/* ── Products ─────────────────────────────────────── */}
                    {products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                        >
                            <div className="border-b border-zinc-100 px-6 py-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                    Items ({products.length})
                                </p>
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {products.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 px-6 py-4"
                                    >
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).style.display = "none";
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="line-clamp-1 text-sm font-semibold text-zinc-900">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-zinc-500">
                                                Size {item.size} • Qty{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="shrink-0 font-semibold text-zinc-900">
                                            ₹
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-zinc-500">
                                        <span>Subtotal</span>
                                        <span>
                                            ₹
                                            {order.subtotal.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>Shipping</span>
                                        <span>
                                            {order.shipping === 0
                                                ? "FREE"
                                                : `₹${order.shipping.toLocaleString("en-IN")}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-zinc-200 pt-2">
                                        <div className="flex justify-between font-bold text-zinc-900">
                                            <span>Total</span>
                                            <span className="font-serif text-lg">
                                                ₹
                                                {order.total.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Actions ──────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3"
                    >
                        <Link href="/orders" className="flex-1">
                            <Button
                                fullWidth
                                variant="outline"
                                leftIcon={<ArrowLeft size={16} />}
                                className="rounded-xl"
                            >
                                All Orders
                            </Button>
                        </Link>
                        <Link href="/shop" className="flex-1">
                            <Button
                                fullWidth
                                leftIcon={<ShoppingBag size={16} />}
                                className="rounded-xl shadow-lg shadow-zinc-900/20"
                            >
                                Shop More
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

// ─── Detail Row ──────────────────────────────────────────────────────────────

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

