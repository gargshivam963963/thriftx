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
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import PremiumImage from "@/components/ui/PremiumImage";
import { useAuth } from "@/lib/AuthContext";
import { getUserOrders } from "@/lib/services/orderService";
import { getDeliveryInfo, formatDeliveryTimeline } from "@/lib/delivery";
import type { Order } from "@/lib/types/order";

// ─── Tracking Step Type ──────────────────────────────────────────────────────

interface TrackingStep {
    status?: string;
    description?: string;
    activity?: string;
    location?: string;
    date?: string;
    time?: string;
}

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
        color: "text-warning",
        bg: "bg-warning-bg",
    },
    Pending: {
        icon: <Clock size={20} />,
        label: "Pending",
        color: "text-warning",
        bg: "bg-warning-bg",
    },
    Processing: {
        icon: <PackageCheck size={20} />,
        label: "Processing",
        color: "text-info",
        bg: "bg-info-bg",
    },
    Shipped: {
        icon: <Truck size={20} />,
        label: "Shipped",
        color: "text-info",
        bg: "bg-info-bg",
    },
    Delivered: {
        icon: <BadgeCheck size={20} />,
        label: "Delivered",
        color: "text-success",
        bg: "bg-success-bg",
    },
    Cancelled: {
        icon: <XCircle size={20} />,
        label: "Cancelled",
        color: "text-error",
        bg: "bg-error-bg",
    },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TrackingSkeleton() {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
                <div className="space-y-4">
                    <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
                    <div className="h-64 animate-pulse rounded-3xl bg-muted" />
                    <div className="h-48 animate-pulse rounded-3xl bg-muted" />
                </div>
            </div>
        </main>
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
                                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-bold ${isCompleted
                                    ? "bg-success text-background shadow-md"
                                    : isCurrent
                                        ? "bg-foreground text-background ring-4 ring-accent/10"
                                        : "bg-muted text-muted-foreground"
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
                                        ? "bg-success-bg"
                                        : "bg-border"
                                        }`}
                                />
                            )}
                        </div>

                        <div className="pt-1.5">
                            <h4
                                className={`text-body-sm font-semibold ${isCurrent
                                    ? "text-foreground"
                                    : isCompleted
                                        ? "text-success-foreground"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {step.title}
                            </h4>
                            <p className="mt-0.5 text-small text-muted-foreground">
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
    const [liveTracking, setLiveTracking] = useState<TrackingStep[] | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    const documentId = params.id as string;

    const fetchLiveTracking = async () => {
        if (!order?.awbNumber) return;
        setTrackingLoading(true);
        try {
            const res = await fetch(`/api/shipping/tracking/${documentId}`);
            const data = (await res.json()) as {
                success: boolean;
                tracking?: TrackingStep[];
            };
            if (data.success && data.tracking) {
                setLiveTracking(data.tracking);
            }
        } catch (err) {
            console.error("Failed to fetch live tracking:", err);
        } finally {
            setTrackingLoading(false);
        }
    };

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

    // Fetch live tracking when order has an AWB
    useEffect(() => {
        if (order?.awbNumber) {
            fetchLiveTracking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.awbNumber]);

    // ── Render ──

    if (authLoading || (loading && !order)) return <TrackingSkeleton />;

    if (error && !order) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto max-w-3xl px-4 py-12 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
                            <AlertCircle size={28} className="text-error" />
                        </div>
                    </div>
                    <h1 className="mt-5 font-display text-heading-4 font-semibold text-foreground">
                        {error}
                    </h1>
                    <p className="mt-2 text-body-sm text-muted-foreground">
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
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/orders"
                        className="group mb-6 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <div className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
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
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${statusConfig.bg}`}
                                >
                                    <div className={statusConfig.color}>
                                        {statusConfig.icon}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Order Status
                                    </p>
                                    <h2
                                        className={`mt-0.5 text-heading-4 font-bold ${statusConfig.color}`}
                                    >
                                        {statusConfig.label}
                                    </h2>
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted px-4 py-2 text-right">
                                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="font-display text-heading-4 font-bold text-foreground">
                                    ₹{order.total.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="px-5 py-5 sm:px-6">
                            <div className="flex items-start gap-4 rounded-2xl bg-warning-bg p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-lg text-warning">
                                    {deliveryInfo.icon}
                                </div>
                                <div>
                                    <p className="text-caption font-semibold uppercase tracking-[0.18em] text-warning">
                                        Estimated Delivery
                                    </p>
                                    <h3 className="mt-0.5 font-display text-heading-4 font-bold text-warning-foreground">
                                        {deliveryInfo.label}
                                    </h3>
                                    <p className="mt-0.5 text-body-sm text-warning-foreground/80">
                                        {deliveryInfo.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="border-t border-border px-5 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Tracking Timeline
                                </p>
                                {order.awbNumber && (
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-muted px-2.5 py-1 text-small font-semibold text-muted-foreground">
                                            AWB: {order.awbNumber}
                                        </span>
                                        {order.trackingUrl && (
                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-small font-semibold text-success-foreground hover:bg-success-bg/80"
                                            >
                                                <ExternalLink size={11} />
                                                Track
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                {liveTracking && liveTracking.length > 0 ? (
                                    <div className="space-y-0">
                                        {liveTracking.map((step, i) => {
                                            const reversed = [...liveTracking].reverse();
                                            const isCurrent = i === 0;
                                            const isCompleted =
                                                i < reversed.length - 1;
                                            // account for we reversed to show latest first
                                            const showIdx = reversed.length - 1 - i;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1, duration: 0.25 }}
                                                    className="relative flex items-start gap-4 pb-8 last:pb-0"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-bold ${showIdx === 0
                                                                ? "bg-foreground text-background ring-4 ring-accent/10"
                                                                : "bg-success text-background shadow-md"
                                                                }`}
                                                        >
                                                            {showIdx === 0 ? (
                                                                <Truck size={16} />
                                                            ) : (
                                                                <CheckCircle2 size={18} />
                                                            )}
                                                        </div>
                                                        {i < liveTracking.length - 1 && (
                                                            <div
                                                                className={`mt-1 h-full w-0.5 ${showIdx > 0 ? "bg-success-bg" : "bg-border"}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="pt-1.5">
                                                        <h4
                                                            className={`text-body-sm font-semibold ${showIdx === 0
                                                                ? "text-foreground"
                                                                : "text-success-foreground"
                                                                }`}
                                                        >
                                                            {step.status || step.description}
                                                        </h4>
                                                        <p className="mt-0.5 text-small text-muted-foreground">
                                                            {step.activity || step.location || ""}
                                                        </p>
                                                        <p className="mt-0.5 text-small text-muted-foreground">
                                                            {step.date || step.time || ""}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        {trackingLoading && (
                                            <div className="mb-3 flex items-center gap-2 text-small text-muted-foreground">
                                                <RefreshCw size={12} className="animate-spin" />
                                                Fetching live tracking...
                                            </div>
                                        )}
                                        <TrackingTimeline
                                            currentStatus={order.status}
                                            steps={timeline.steps}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Order Details ────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Order Details
                            </p>
                        </div>

                        <div className="divide-y divide-border px-5 sm:px-6">
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
                            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                        >
                            <div className="border-b border-border px-5 py-4 sm:px-6">
                                <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Items ({products.length})
                                </p>
                            </div>

                            <div className="divide-y divide-border">
                                {products.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                                    >
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                                            <PremiumImage
                                                src={item.image || "/images/placeholder.jpg"}
                                                alt={item.title}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                                fallbackSrc="/images/placeholder.jpg"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="line-clamp-1 text-body-sm font-semibold text-foreground">
                                                {item.title}
                                            </h4>
                                            <p className="text-small text-muted-foreground">
                                                Size {item.size} • Qty{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="shrink-0 font-semibold text-foreground">
                                            ₹
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-border bg-muted/50 px-5 py-4 sm:px-6">
                                <div className="space-y-2 text-body-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>
                                            ₹
                                            {order.subtotal.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>
                                            {order.shipping === 0
                                                ? "FREE"
                                                : `₹${order.shipping.toLocaleString("en-IN")}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-2">
                                        <div className="flex justify-between font-bold text-foreground">
                                            <span>Total</span>
                                            <span className="font-display text-heading-4">
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
                                className="rounded-xl shadow-card"
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-0.5 text-body-sm font-medium text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
}

