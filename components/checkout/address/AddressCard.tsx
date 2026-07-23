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

    deleting?: boolean;
}

export default function AddressCard({
    address,
    selected,
    onSelect,
    onEdit,
    onDelete,
}: AddressCardProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const TypeIcon =
        address.type === "Home"
            ? Home
            : address.type === "Work"
                ? BriefcaseBusiness
                : Building2;

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

    return (
        <>
            <motion.div
                layout
                role="button"
                tabIndex={0}
                onClick={onSelect}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200 ${selected
                    ? "border-black shadow-lg"
                    : "border-zinc-200 hover:border-zinc-400"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div
                            className={`rounded-full p-2 ${selected
                                ? "bg-black text-white"
                                : "bg-zinc-100 text-zinc-700"
                                }`}
                        >
                            <TypeIcon size={18} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-zinc-900">
                                {address.fullName}
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                                {address.type}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {address.isDefault && (
                            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                                ✓ Default Address
                            </span>
                        )}

                        {selected && (
                            <CheckCircle2
                                size={22}
                                className="text-emerald-600"
                            />
                        )}

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="rounded-xl border border-zinc-200 p-2 transition hover:border-black hover:bg-black hover:text-white"
                            >
                                <Pencil size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    <div className="flex items-start gap-3">
                        <MapPinned
                            size={18}
                            className="mt-1 text-zinc-400"
                        />

                        <div className="text-sm leading-7 text-zinc-700">
                            <p>{address.addressLine1}</p>

                            {address.addressLine2 && (
                                <p>{address.addressLine2}</p>
                            )}

                            {address.landmark && (
                                <p>{address.landmark}</p>
                            )}

                            <p>
                                {address.city}, {address.state}
                            </p>

                            <p>{address.pincode}</p>
                        </div>
                    </div>

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

                            {address.alternatePhone && (
                                <p className="mt-1 text-sm text-zinc-500">
                                    Alt: {address.alternatePhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {selected && (
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-600"
                                />

                                <span className="text-sm font-medium text-emerald-700">
                                    Selected for this order
                                </span>
                            </div>
                        </div>
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
