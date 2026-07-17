"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    Clock3,
    FileText,
    Package,
    ShoppingBag,
    Sparkles,
    Truck,
} from "lucide-react";
import { getUserOrders } from "@/lib/services/orderService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Order {
    $id: string;
    $createdAt: string;

    orderId: string;
    status: string;

    total: number;

    firstName: string;
    lastName: string;
    city: string;

    products: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError(null);

            const orders = await getUserOrders();

            // const mappedOrders: Order[] = data.documents.map((doc) => ({
            //     $id: doc.$id,
            //     $createdAt: doc.$createdAt,
            //     orderId: doc.orderId,
            //     status: doc.status,
            //     total: doc.total,
            //     firstName: doc.firstName,
            //     lastName: doc.lastName,
            //     city: doc.city,
            // }));

            setOrders(orders);
        } catch (err) {
            console.error(err);
            setError("Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    }

    const orderStats = useMemo(() => {
        return {
            totalOrders: orders.length,

            delivered: orders.filter(
                (order) => order.status === "Delivered"
            ).length,

            pending: orders.filter(
                (order) => order.status === "Pending"
            ).length,

            cancelled: orders.filter(
                (order) => order.status === "Cancelled"
            ).length,

            totalSpent: orders.reduce(
                (sum, order) => sum + order.total,
                0
            ),
        };
    }, [orders]);

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h2 className="text-xl font-semibold">
                    Something went wrong
                </h2>

                <p className="mt-2 text-neutral-500">
                    {error}
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-20 text-center">
                Loading orders...
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-5xl mx-auto py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">My Orders</h1>
                <p className="text-gray-500 mb-6">No orders found.</p>

                <Link
                    href="/shop"
                    className="bg-black text-white px-6 py-3 rounded-lg"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(date));
    }

    function formatOrderDate(date: string) {
        return new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(date));
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-700";

            case "Shipped":
                return "bg-blue-100 text-blue-700";

            case "Processing":
                return "bg-purple-100 text-purple-700";

            case "Cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-yellow-100 text-yellow-700";
        }
    }

    return (
        <div className="mx-auto min-w-1/12 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 p-6 shadow-sm sm:p-8"
            >
                {/* Background Blur */}
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-neutral-300/20 blur-3xl" />

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                    {/* Left */}
                    <div className="max-w-2xl">

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-medium text-neutral-700 shadow-sm">
                            <Sparkles className="h-4 w-4" />
                            THRIFTX Orders
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                            My Orders
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                            Track every purchase, monitor deliveries,
                            and manage your orders with a premium shopping
                            experience.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/shop">
                                <Button
                                    size="lg"
                                    rightIcon={<ArrowRight size={18} />}
                                >
                                    Continue Shopping
                                </Button>
                            </Link>

                        </div>

                    </div>

                    {/* Right */}
                    <div className="flex items-center justify-center">

                        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-black text-white shadow-xl">
                            <ShoppingBag className="h-14 w-14" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

                {/* Total Orders */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                    <Package className="mb-3 h-6 w-6 text-neutral-900" />

                    <p className="text-sm text-neutral-500">
                        Total Orders
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {orderStats.totalOrders}
                    </h2>

                </div>

                {/* Pending */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                    <Clock3 className="mb-3 h-6 w-6 text-amber-500" />

                    <p className="text-sm text-neutral-500">
                        Pending
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {orderStats.pending}
                    </h2>

                </div>

                {/* Delivered */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                    <BadgeCheck className="mb-3 h-6 w-6 text-green-600" />

                    <p className="text-sm text-neutral-500">
                        Delivered
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {orderStats.delivered}
                    </h2>

                </div>

                {/* Total Spent */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                    <Truck className="mb-3 h-6 w-6 text-sky-500" />

                    <p className="text-sm text-neutral-500">
                        Total Spent
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {formatCurrency(orderStats.totalSpent)}
                    </h2>

                </div>

            </div>

            <div className="mt-8 space-y-6">
                {orders.map((order, index) => {
                    const products = JSON.parse(order.products || "[]");
                    const firstProduct = products[0];
                    return (
                        <motion.article
                            key={order.$id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.35,
                                delay: index * 0.08,
                            }}
                            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Product Section */}
                            <div className="border-b border-neutral-100 p-6">
                                <div className="flex flex-col gap-5 sm:flex-row">

                                    {/* Product Image */}
                                    <div className="h-28 w-28 overflow-hidden rounded-2xl bg-neutral-100">
                                        <img
                                            src={firstProduct?.image || "/assets/placeholder.png"}
                                            alt={firstProduct?.title || "Product"}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-1 flex-col justify-between">

                                        <div>

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h2 className="text-2xl font-bold text-neutral-900">
                                                    {firstProduct?.title}
                                                </h2>

                                                <span
                                                    className={cn(
                                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                                        getStatusBadge(order.status)
                                                    )}
                                                >
                                                    {order.status}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm text-neutral-500">
                                                {firstProduct?.brand}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-5 text-sm text-neutral-500">

                                                <p>
                                                    <span className="font-semibold text-neutral-800">
                                                        Order ID:
                                                    </span>{" "}
                                                    {order.orderId}
                                                </p>

                                                <p>
                                                    <span className="font-semibold text-neutral-800">
                                                        Placed:
                                                    </span>{" "}
                                                    {formatOrderDate(order.$createdAt)}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">

                                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                                                Size {firstProduct?.size || "Free Size"}
                                            </span>

                                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                                                Qty {firstProduct?.quantity}
                                            </span>

                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                    {/* Left */}
                                    <div className="flex flex-wrap items-center gap-8">

                                        {/* Price */}
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500">
                                                Total Paid
                                            </p>

                                            <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
                                                ₹{order.total.toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        {/* Payment */}
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500">
                                                Payment
                                            </p>

                                            <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                ✓ Paid
                                            </div>
                                        </div>

                                        {/* Delivery */}
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500">
                                                Expected Delivery
                                            </p>

                                            <p className="mt-1 text-base font-semibold text-neutral-900">
                                                22 Jul 2026
                                            </p>

                                            <p className="text-sm text-neutral-500">
                                                5 days remaining
                                            </p>
                                        </div>

                                    </div>

                                    {/* Right */}
                                    <div className="flex flex-wrap gap-3">

                                        <Button
                                            variant="outline"
                                            leftIcon={<FileText size={18} />}
                                            className="h-14 min-w-[180px] rounded-2xl"
                                        >
                                            <div className="flex flex-col items-start leading-tight">
                                                <span className="font-semibold">
                                                    View Details
                                                </span>

                                                <span className="text-xs text-neutral-500">
                                                    Invoice & Order Info
                                                </span>
                                            </div>
                                        </Button>

                                        {order.status === "Delivered" ? (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    className="h-14 min-w-[180px] rounded-2xl"
                                                >
                                                    Buy Again
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="h-14 rounded-2xl"
                                                >
                                                    Write Review
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                className="h-14 min-w-[220px] rounded-2xl"
                                                leftIcon={<Truck size={18} />}
                                                rightIcon={<ArrowRight size={18} />}
                                            >
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span className="font-semibold">
                                                        Track Package
                                                    </span>

                                                    <span className="text-xs text-white/70">
                                                        Live Delivery Status
                                                    </span>
                                                </div>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </div>
    );
}