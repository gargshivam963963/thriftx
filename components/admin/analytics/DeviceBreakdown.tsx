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
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border dark:bg-foreground">
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-white p-5 text-center dark:border-border dark:bg-foreground">
                <Smartphone size={24} className="mx-auto text-muted-foreground dark:text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No device data yet</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-white p-5 dark:border-border dark:bg-foreground"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Device Breakdown
            </h3>

            <div className="mt-4 space-y-3">
                {data.map((device) => {
                    const config = DEVICE_CONFIG[device.type] || {
                        icon: <Monitor size={16} />,
                        label: device.type,
                        color: "text-muted-foreground",
                    };

                    return (
                        <div key={device.type}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={config.color}>{config.icon}</span>
                                    <span className="font-medium text-muted-foreground">
                                        {config.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground dark:text-white">
                                        {device.count.toLocaleString()}
                                    </span>
                                    <span className="w-8 text-right text-xs text-muted-foreground">
                                        {device.percentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
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

