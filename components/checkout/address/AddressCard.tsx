"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Home,
    BriefcaseBusiness,
    Building2,
    Pencil,
    Phone,
    MapPinned,
    Trash2,
} from "lucide-react";

import type { Address } from "@/lib/types/address";
import ConfirmPopover from "@/components/ui/ConfirmPopover";

interface AddressCardProps {
    address: Address;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const typeConfig = {
    Home: {
        icon: Home,
        color: "bg-amber-100 text-amber-700",
        label: "Home",
    },
    Work: {
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700",
        label: "Work",
    },
    Other: {
        icon: Building2,
        color: "bg-purple-100 text-purple-700",
        label: "Other",
    },
} as const;

export default function AddressCard({
    address,
    selected,
    onSelect,
    onEdit,
    onDelete,
}: AddressCardProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const typeInfo = typeConfig[address.type] ?? typeConfig.Home;
    const TypeIcon = typeInfo.icon;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await onDelete();
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };

    return (
        <>
            <motion.div
                layout
                role="button"
                tabIndex={0}
                onClick={onSelect}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect();
                    }
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200 ${selected
                        ? "border-zinc-900 ring-1 ring-zinc-900/20 shadow-lg shadow-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-400 hover:shadow-md"
                    }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className={`rounded-full p-2 ${selected
                                    ? "bg-zinc-900 text-white"
                                    : typeInfo.color
                                }`}
                        >
                            <TypeIcon size={18} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-zinc-900">
                                {address.fullName}
                            </h3>
                            <p className="mt-0.5 text-sm text-zinc-500">{address.type}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {address.isDefault && (
                            <span className="hidden sm:inline-flex rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-semibold tracking-wider text-white">
                                Default
                            </span>
                        )}

                        {selected && (
                            <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
                        )}

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="rounded-xl border border-zinc-200 p-2 text-zinc-600 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                                aria-label="Edit address"
                            >
                                <Pencil size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="rounded-xl border border-red-200 p-2 text-red-500 transition hover:bg-red-600 hover:text-white"
                                aria-label="Delete address"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="space-y-4 p-5 sm:p-6">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                        <MapPinned size={18} className="mt-1 shrink-0 text-zinc-400" />
                        <div className="text-sm leading-7 text-zinc-700">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            {address.landmark && <p className="text-zinc-500">{address.landmark}</p>}
                            <p>
                                {address.city}, {address.state} - {address.pincode}
                            </p>
                        </div>
                    </div>

                    {/* Phone */}
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

                    {/* Default badge on mobile */}
                    {address.isDefault && (
                        <div className="sm:hidden">
                            <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-600">
                                Default Address
                            </span>
                        </div>
                    )}

                    {/* Selected indicator */}
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3">
                                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">
                                    Selected for this order
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <ConfirmPopover
                open={confirmOpen}
                title="Remove Address?"
                description={`Are you sure you want to delete the address for ${address.fullName}? This action cannot be undone.`}
                confirmText={deleting ? "Removing..." : "Remove"}
                cancelText="Cancel"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

