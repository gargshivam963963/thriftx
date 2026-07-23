"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    Home,
    BriefcaseBusiness,
    MapPinned,
    Pencil,
    Phone,
    MapPin,
    Building2,
} from "lucide-react";

import type { Address } from "@/lib/types/address";

interface AddressSummaryProps {
    address: Address;
    onChange: () => void;
    compact?: boolean;
}

const typeConfig = {
    Home: { icon: Home, color: "bg-amber-100 text-amber-700" },
    Work: { icon: BriefcaseBusiness, color: "bg-blue-100 text-blue-700" },
    Other: { icon: Building2, color: "bg-purple-100 text-purple-700" },
} as const;

export default function AddressSummary({
    address,
    onChange,
    compact = false,
}: AddressSummaryProps) {
    const typeInfo = typeConfig[address.type] ?? typeConfig.Home;
    const TypeIcon = typeInfo.icon;

    const fullAddress = [
        address.addressLine1,
        address.addressLine2,
        address.landmark,
        `${address.city}, ${address.state} - ${address.pincode}`,
    ]
        .filter(Boolean)
        .join(", ");

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 sm:p-2 text-emerald-600">
                        <CheckCircle2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                            Delivering To
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-zinc-900 text-sm sm:text-base">
                                {address.fullName}
                            </h4>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeInfo.color}`}
                            >
                                <TypeIcon size={10} />
                                {address.type}
                            </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs sm:text-sm leading-6 text-zinc-500">
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={onChange}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
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
            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-1.5 sm:p-2 text-emerald-600">
                        <CheckCircle2 size={18} className="sm:h-[20px] sm:w-[20px]" />
                    </div>

                    <div>
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                            Delivery Address
                        </p>
                        <h3 className="mt-0.5 text-base sm:text-lg font-semibold text-zinc-900">
                            Address Selected
                        </h3>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={onChange}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                    <Pencil size={14} />
                    Change
                </motion.button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5 sm:p-6">
                {/* Name & Type */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h4 className="text-lg sm:text-xl font-semibold text-zinc-900">
                            {address.fullName}
                        </h4>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700">
                            <TypeIcon size={14} />
                            {address.type}
                        </div>
                    </div>

                    {address.isDefault && (
                        <span className="inline-flex self-start rounded-full bg-zinc-900 px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white">
                            Default
                        </span>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-3">
                        <MapPinned size={18} className="mt-1 shrink-0 text-zinc-400" />
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                Delivery Address
                            </p>
                            <div className="mt-2 text-sm leading-7 text-zinc-700">
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                {address.landmark && <p className="text-zinc-500">{address.landmark}</p>}
                                <p>
                                    {address.city}, {address.state}
                                </p>
                                <p className="font-medium">{address.pincode}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Phone size={18} className="mt-1 shrink-0 text-zinc-400" />
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Phone
                                </p>
                                <p className="mt-1.5 font-medium text-zinc-800">{address.phone}</p>
                                {address.alternatePhone && (
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Alt: {address.alternatePhone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

