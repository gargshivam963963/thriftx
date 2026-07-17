"use client";

import { BadgeCheck, Clock3, PackageCheck, Truck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
    status: string;
}

const STATUS_STYLES: Record<
    string,
    {
        label: string;
        className: string;
        icon: React.ReactNode;
    }
> = {
    Pending: {
        label: "Pending",
        className:
            "border-amber-200 bg-amber-50 text-amber-700",
        icon: <Clock3 className="h-4 w-4" />,
    },

    Processing: {
        label: "Processing",
        className:
            "border-violet-200 bg-violet-50 text-violet-700",
        icon: <PackageCheck className="h-4 w-4" />,
    },

    Shipped: {
        label: "Shipped",
        className:
            "border-sky-200 bg-sky-50 text-sky-700",
        icon: <Truck className="h-4 w-4" />,
    },

    Delivered: {
        label: "Delivered",
        className:
            "border-green-200 bg-green-50 text-green-700",
        icon: <BadgeCheck className="h-4 w-4" />,
    },

    Cancelled: {
        label: "Cancelled",
        className:
            "border-red-200 bg-red-50 text-red-700",
        icon: <XCircle className="h-4 w-4" />,
    },
};

export function OrderStatusBadge({
    status,
}: OrderStatusBadgeProps) {
    const config =
        STATUS_STYLES[status] ??
        {
            label: status,
            className:
                "border-neutral-200 bg-neutral-100 text-neutral-700",
            icon: <Clock3 className="h-4 w-4" />,
        };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
                config.className
            )}
        >
            {config.icon}

            {config.label}
        </span>
    );
}