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
    BadgeCheck,
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
        color: "bg-amber-100 text-amber-700 border-amber-200",
        selectedColor: "bg-amber-500/20 text-amber-300",
        label: "Home",
    },
    Work: {
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        selectedColor: "bg-blue-500/20 text-blue-300",
        label: "Work",
    },
    Other: {
        icon: Building2,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        selectedColor: "bg-purple-500/20 text-purple-300",
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
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 sm:rounded-3xl ${selected
                        ? "border-neutral-900 bg-neutral-50/30 ring-1 ring-neutral-900/20 shadow-lg"
                        : "border-neutral-200 hover:border-neutral-400 hover:shadow-md"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`rounded-full p-2 transition-colors ${selected
                                    ? "bg-neutral-900 text-white"
                                    : typeInfo.color
                                }`}
                        >
                            <TypeIcon size={16} className="sm:h-[18px] sm:w-[18px]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 sm:text-base">
                                {address.fullName}
                            </h3>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${selected ? typeInfo.selectedColor : typeInfo.color
                                        }`}
                                >
                                    <TypeIcon size={10} />
                                    {address.type}
                                </span>
                                {address.isDefault && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white">
                                        <BadgeCheck size={10} />
                                        Default
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {selected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                <CheckCircle2
                                    size={22}
                                    className="shrink-0 text-emerald-600"
                                />
                            </motion.div>
                        )}

                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                            aria-label="Edit address"
                        >
                            <Pencil size={14} className="sm:h-[15px] sm:w-[15px]" />
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="rounded-xl border border-red-200 p-2 text-red-500 transition hover:bg-red-600 hover:text-white"
                            aria-label="Delete address"
                        >
                            <Trash2 size={14} className="sm:h-[15px] sm:w-[15px]" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                        <MapPinned
                            size={16}
                            className="mt-0.5 shrink-0 text-neutral-400 sm:mt-1 sm:h-[18px] sm:w-[18px]"
                        />
                        <div className="text-sm leading-6 text-neutral-700 sm:leading-7">
                            <p className="font-medium text-neutral-900">
                                {address.addressLine1}
                            </p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            {address.landmark && (
                                <p className="text-neutral-500">📍 {address.landmark}</p>
                            )}
                            <p className="text-neutral-600">
                                {address.city}, {address.state}{" "}
                                <span className="font-semibold text-neutral-800">
                                    — {address.pincode}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                        <Phone
                            size={16}
                            className="mt-0.5 shrink-0 text-neutral-400 sm:mt-1 sm:h-[18px] sm:w-[18px]"
                        />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 sm:text-[11px]">
                                Contact
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-neutral-800 sm:text-base">
                                {address.phone}
                            </p>
                            {address.alternatePhone && (
                                <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">
                                    Alt: {address.alternatePhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Selected indicator */}
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5">
                                <CheckCircle2
                                    size={16}
                                    className="shrink-0 text-emerald-600"
                                />
                                <span className="text-xs font-medium text-emerald-700 sm:text-sm">
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

