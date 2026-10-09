"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    Home,
    BriefcaseBusiness,
    MapPinned,
    Pencil,
    Phone,
    Building2,
} from "lucide-react";

import type { Address } from "@/lib/types/address";
import {
    press,
    transitions,
} from "@/components/animations/Motion";

interface AddressSummaryProps {
    address: Address;
    onChange: () => void;
    compact?: boolean;
}

const typeConfig = {
    Home: {
        icon: Home,
        color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25",
    },
    Work: {
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25",
    },
    Other: {
        icon: Building2,
        color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25",
    },
} as const;

function getFullAddress(address: Address) {
    return [
        address.addressLine1,
        address.addressLine2,
        address.landmark,
        `${address.city}, ${address.state} — ${address.pincode}`,
    ]
        .filter(Boolean)
        .join(", ");
}

export default function AddressSummary({
    address,
    onChange,
    compact = false,
}: AddressSummaryProps) {
    const typeInfo = typeConfig[address.type] ?? typeConfig.Home;
    const TypeIcon = typeInfo.icon;
    const fullAddress = getFullAddress(address);

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <span className="mt-0.5 shrink-0 rounded-full bg-success-bg p-1.5 text-success-foreground sm:p-2">
                        <CheckCircle2 size={17} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="text-badge font-semibold uppercase tracking-wider text-success-foreground">
                            Delivering To
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground sm:text-base">
                                {address.fullName}
                            </h4>

                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-badge font-medium ${typeInfo.color}`}
                            >
                                <TypeIcon size={10} />
                                {address.type}
                            </span>
                        </div>

                        <p className="mt-1 line-clamp-2 break-words text-xs leading-6 text-muted-foreground sm:text-sm">
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={onChange}
                    whileHover={{ scale: 1.03 }}
                    whileTap={press.tap}
                    transition={transitions.micro}
                    className="min-h-10 shrink-0 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 sm:px-4 sm:text-sm"
                >
                    Change
                </motion.button>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={transitions.normal}
            className="overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
        >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-subtle/80 to-card px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-success-bg p-1.5 text-success-foreground sm:p-2">
                        <CheckCircle2 size={19} />
                    </span>

                    <div>
                        <p className="text-badge font-semibold uppercase tracking-wider text-success-foreground">
                            Delivery Address
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">
                            Address Selected
                        </h3>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={onChange}
                    whileHover={{ scale: 1.03 }}
                    whileTap={press.tap}
                    transition={transitions.micro}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 sm:px-4 sm:text-sm"
                >
                    <Pencil size={14} />
                    Change
                </motion.button>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-foreground sm:text-xl">
                            {address.fullName}
                        </h4>

                        {address.isDefault && (
                            <span className="mt-1.5 inline-flex rounded-full bg-foreground px-3 py-1 text-badge font-semibold uppercase tracking-wider text-background dark:bg-white dark:text-zinc-950">
                                Default
                            </span>
                        )}
                    </div>

                    <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${typeInfo.color}`}
                    >
                        <TypeIcon size={14} />
                        {address.type}
                    </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex min-w-0 gap-3">
                        <MapPinned
                            size={18}
                            className="mt-0.5 shrink-0 text-muted-foreground"
                        />

                        <div className="min-w-0">
                            <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground sm:text-small">
                                Delivery Address
                            </p>

                            <div className="mt-1.5 break-words text-sm leading-6 text-muted-foreground sm:leading-7">
                                <p className="font-medium text-foreground">
                                    {address.addressLine1}
                                </p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                {address.landmark && <p>📍 {address.landmark}</p>}
                                <p>
                                    {address.city}, {address.state}
                                </p>
                                <p className="font-semibold text-foreground">
                                    {address.pincode}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Phone
                            size={18}
                            className="mt-0.5 shrink-0 text-muted-foreground"
                        />

                        <div>
                            <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground sm:text-small">
                                Contact
                            </p>

                            <p className="mt-1.5 font-medium text-foreground">
                                {address.phone}
                            </p>

                            {address.alternatePhone && (
                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                    Alt: {address.alternatePhone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}