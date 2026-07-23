// components/checkout/address/AddressSummary.tsx

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

export default function AddressSummary({
    address,
    onChange,
    compact = false,
}: AddressSummaryProps) {
    const TypeIcon =
        address.type === "Home"
            ? Home
            : address.type === "Work"
                ? BriefcaseBusiness
                : Building2;

    const fullAddress = [
        address.addressLine1,
        address.addressLine2,
        address.landmark,
        `${address.city}, ${address.state}`,
        address.pincode,
    ]
        .filter(Boolean)
        .join(", ");

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-600">
                        <CheckCircle2 size={18} />
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
                            Delivering To
                        </p>

                        <h4 className="mt-1 font-semibold text-zinc-900">
                            {address.fullName}
                        </h4>

                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                            {fullAddress}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onChange}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                >
                    Change
                </button>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -10,
            }}
            transition={{
                duration: 0.25,
            }}
            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"
        >
            <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
                            Delivery Address
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-zinc-900">
                            Address Selected
                        </h3>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onChange}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                >
                    <Pencil size={15} />
                    Change
                </button>
            </div>

            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between gap-5">
                    <div>
                        <h4 className="text-xl font-semibold text-zinc-900">
                            {address.fullName}
                        </h4>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                            <TypeIcon size={16} />
                            {address.type}
                        </div>
                    </div>

                    {address.isDefault && (
                        <span className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                            Default
                        </span>
                    )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="flex gap-3">
                        <MapPinned
                            size={18}
                            className="mt-1 text-zinc-400"
                        />

                        <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-400">
                                Delivery Address
                            </p>

                            <p className="mt-2 text-sm leading-7 text-zinc-700">
                                {address.addressLine1}

                                {address.addressLine2 && (
                                    <>
                                        <br />
                                        {address.addressLine2}
                                    </>
                                )}

                                {address.landmark && (
                                    <>
                                        <br />
                                        {address.landmark}
                                    </>
                                )}

                                <br />

                                {address.city}, {address.state}

                                <br />

                                {address.pincode}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-start gap-3">
                            <Phone
                                size={18}
                                className="mt-1 text-zinc-400"
                            />

                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-400">
                                    Phone
                                </p>

                                <p className="mt-2 font-medium text-zinc-800">
                                    {address.phone}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin
                                size={18}
                                className="mt-1 text-zinc-400"
                            />

                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-400">
                                    Delivery Area
                                </p>

                                <p className="mt-2 text-zinc-700">
                                    {address.city}, {address.state}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}