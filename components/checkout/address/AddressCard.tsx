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

import { Button } from "@/components/ui/button";
import ConfirmPopover from "@/components/ui/ConfirmPopover";
import type { Address } from "@/lib/types/address";

interface AddressCardProps {
    address: Address;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void | Promise<void>;
}

const typeConfig = {
    Home: {
        icon: Home,
        color: "bg-amber-100 text-amber-700 border-amber-200",
        selectedColor: "bg-amber-500/20 text-amber-300",
    },
    Work: {
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        selectedColor: "bg-blue-500/20 text-blue-300",
    },
    Other: {
        icon: Building2,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        selectedColor: "bg-purple-500/20 text-purple-300",
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

    const handleDelete = async () => {
        if (deleting) return;

        setDeleting(true);

        try {
            await onDelete();
            setConfirmOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <motion.article
                layout
                whileHover={{ y: -2 }}
                className={`w-full overflow-hidden rounded-2xl border bg-card transition-all duration-200 sm:rounded-3xl ${selected
                    ? "border-foreground bg-muted/30 ring-1 ring-foreground/20 shadow-lg"
                    : "border-border hover:border-foreground/50 hover:shadow-md"
                    }`}
            >
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4">
                    <button
                        type="button"
                        onClick={onSelect}
                        aria-pressed={selected}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <span
                            className={`shrink-0 rounded-full p-2 ${selected
                                ? "bg-foreground text-background"
                                : typeInfo.color
                                }`}
                        >
                            <TypeIcon size={17} />
                        </span>

                        <span className="min-w-0">
                            <span className="block truncate text-body font-semibold text-foreground">
                                {address.fullName}
                            </span>

                            <span className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-badge font-medium ${selected ? typeInfo.selectedColor : typeInfo.color
                                        }`}
                                >
                                    <TypeIcon size={10} />
                                    {address.type}
                                </span>

                                {address.isDefault && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-badge font-semibold text-background">
                                        <BadgeCheck size={10} />
                                        Default
                                    </span>
                                )}
                            </span>
                        </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {selected && (
                            <CheckCircle2
                                size={20}
                                aria-label="Selected address"
                                className="text-success"
                            />
                        )}

                        <Button
                            type="button"
                            variant="ghost"
                            size="iconSm"
                            onClick={onEdit}
                            aria-label={`Edit address for ${address.fullName}`}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-background"
                        >
                            <Pencil size={14} />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="iconSm"
                            onClick={() => setConfirmOpen(true)}
                            disabled={deleting}
                            aria-label={`Delete address for ${address.fullName}`}
                            className="rounded-xl border border-red-200 p-2 text-red-500 transition hover:bg-red-600 hover:text-white dark:border-red-900/60 dark:text-red-400"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onSelect}
                    aria-pressed={selected}
                    className="block w-full space-y-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-6"
                >
                    <span className="flex items-start gap-3">
                        <MapPinned
                            size={17}
                            className="mt-1 shrink-0 text-muted-foreground"
                        />

                        <span className="text-body leading-6 text-muted-foreground">
                            <span className="block font-medium text-foreground">
                                {address.addressLine1}
                            </span>

                            {address.addressLine2 && (
                                <span className="block">{address.addressLine2}</span>
                            )}

                            {address.landmark && (
                                <span className="block">📍 {address.landmark}</span>
                            )}

                            <span className="block">
                                {address.city}, {address.state} —{" "}
                                <strong className="text-foreground">
                                    {address.pincode}
                                </strong>
                            </span>
                        </span>
                    </span>

                    <span className="flex items-start gap-3">
                        <Phone
                            size={17}
                            className="mt-1 shrink-0 text-muted-foreground"
                        />

                        <span>
                            <span className="block text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                Contact
                            </span>
                            <span className="mt-1 block text-body font-medium text-foreground">
                                {address.phone}
                            </span>

                            {address.alternatePhone && (
                                <span className="mt-1 block text-small text-muted-foreground">
                                    Alt: {address.alternatePhone}
                                </span>
                            )}
                        </span>
                    </span>

                    {selected && (
                        <span className="flex items-center gap-2 rounded-xl bg-success-bg px-4 py-2.5 text-small font-medium text-success-foreground">
                            <CheckCircle2 size={16} />
                            Selected for this order
                        </span>
                    )}
                </button>
            </motion.article>

            <ConfirmPopover
                open={confirmOpen}
                title="Remove Address?"
                description={`Are you sure you want to delete the address for ${address.fullName}? This action cannot be undone.`}
                confirmText={deleting ? "Removing..." : "Remove"}
                cancelText="Cancel"
                onCancel={() => {
                    if (!deleting) setConfirmOpen(false);
                }}
                onConfirm={handleDelete}
            />
        </>
    );
}