"use client";

import { motion } from "framer-motion";
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface DeviceItem {
    type: string;
    count: number;
    percentage: number;
}

const DEVICE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    mobile: {
        icon: <Smartphone size={16} />,
        label: "Mobile",
        color: "text-emerald-500",
    },
    tablet: {
        icon: <Tablet size={16} />,
        label: "Tablet",
        color: "text-amber-500",
    },
    desktop: {
        icon: <Monitor size={16} />,
        label: "Desktop",
        color: "text-blue-500",
    },
};

export default function DeviceBreakdown({
    data,
    loading,
}: {
    data: DeviceItem[] | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <Smartphone size={24} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500">No device data yet</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Device Breakdown
            </h3>

            <div className="mt-4 space-y-3">
                {data.map((device) => {
                    const config = DEVICE_CONFIG[device.type] || {
                        icon: <Monitor size={16} />,
                        label: device.type,
                        color: "text-neutral-500",
                    };

                    return (
                        <div key={device.type}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={config.color}>{config.icon}</span>
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                        {config.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                        {device.count.toLocaleString()}
                                    </span>
                                    <span className="w-8 text-right text-xs text-neutral-400">
                                        {device.percentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${device.percentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={`h-full rounded-full ${device.type === "mobile"
                                            ? "bg-emerald-500"
                                            : device.type === "tablet"
                                                ? "bg-amber-500"
                                                : "bg-blue-500"
                                        }`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

