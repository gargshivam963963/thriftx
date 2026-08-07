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

interface AddressSummaryProps {
    address: Address;
    onChange: () => void;
    compact?: boolean;
}

const typeConfig = {
    Home: { icon: Home, color: "bg-amber-100 text-amber-700 border-amber-200" },
    Work: {
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    Other: {
        icon: Building2,
        color: "bg-purple-100 text-purple-700 border-purple-200",
    },
} as const;

function FullAddress({ address }: { address: Address }) {
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
    const fullAddress = FullAddress({ address });

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600 sm:p-2">
                        <CheckCircle2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 sm:text-[11px]">
                            Delivering To
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground sm:text-base">
                                {address.fullName}
                            </h4>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeInfo.color}`}
                            >
                                <TypeIcon size={10} />
                                {address.type}
                            </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={onChange}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:bg-foreground hover:text-white sm:px-4 sm:py-2 sm:text-sm"
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-subtle/80 to-card px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-600 sm:p-2">
                        <CheckCircle2 size={18} className="sm:h-[20px] sm:w-[20px]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 sm:text-[11px]">
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
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:bg-foreground hover:text-white sm:px-4 sm:py-2 sm:text-sm"
                >
                    <Pencil size={14} />
                    Change
                </motion.button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5 sm:p-6">
                {/* Name & Type */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-foreground sm:text-xl">
                            {address.fullName}
                        </h4>
                        {address.isDefault && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
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

                {/* Details Grid */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex gap-3">
                        <MapPinned
                            size={18}
                            className="mt-0.5 shrink-0 text-muted-foreground sm:mt-1"
                        />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px]">
                                Delivery Address
                            </p>
                            <div className="mt-1.5 text-sm leading-6 text-muted-foreground sm:leading-7">
                                <p className="font-medium text-foreground">
                                    {address.addressLine1}
                                </p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                {address.landmark && (
                                    <p className="text-muted-foreground">📍 {address.landmark}</p>
                                )}
                                <p className="text-muted-foreground">
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
                            className="mt-0.5 shrink-0 text-muted-foreground sm:mt-1"
                        />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px]">
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

