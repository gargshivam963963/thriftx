"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CalendarDays,
    MapPin,
    Receipt,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { Order } from "./order.types";

interface OrderCardProps {
    order: Order;
    index: number;
}

export function OrderCard({
    order,
    index,
}: OrderCardProps) {
    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 24,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
                delay: index * 0.08,
            }}
            whileHover={{
                y: -4,
            }}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
        >
            {/* Header */}

            <div className="flex flex-col gap-5 border-b border-neutral-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                        Order ID
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                        #{order.orderId}
                    </h3>

                </div>

                <OrderStatusBadge
                    status={order.status}
                />

            </div>

            {/* Body */}

            <div className="grid gap-6 p-6 md:grid-cols-3">

                <div>

                    <div className="mb-2 flex items-center gap-2 text-neutral-500">

                        <User className="h-4 w-4" />

                        <span className="text-sm">
                            Customer
                        </span>

                    </div>

                    <p className="font-semibold">

                        {order.firstName} {order.lastName}

                    </p>

                </div>

                <div>

                    <div className="mb-2 flex items-center gap-2 text-neutral-500">

                        <MapPin className="h-4 w-4" />

                        <span className="text-sm">
                            Shipping
                        </span>

                    </div>

                    <p className="font-semibold">

                        {order.city}

                    </p>

                </div>

                <div>

                    <div className="mb-2 flex items-center gap-2 text-neutral-500">

                        <Receipt className="h-4 w-4" />

                        <span className="text-sm">
                            Total Amount
                        </span>

                    </div>

                    <p className="text-2xl font-bold">

                        ₹{order.total.toLocaleString("en-IN")}

                    </p>

                </div>

            </div>

            {/* Footer */}

            <div className="flex flex-col gap-4 border-t border-neutral-100 bg-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2 text-sm text-neutral-500">

                    <CalendarDays className="h-4 w-4" />

                    {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }).format(new Date(order.$createdAt))}

                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    <Button
                        variant="outline"
                    >
                        View Details
                    </Button>

                    <Link
                        href={`/orders/${order.orderId}`}
                    >
                        <Button
                            rightIcon={<ArrowRight size={16} />}
                        >
                            Track Order
                        </Button>
                    </Link>

                </div>

            </div>

        </motion.article>
    );
}