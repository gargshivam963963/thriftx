"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPinPlus, Plus } from "lucide-react";

import type { Address } from "@/lib/types/address";
import AddressCard from "@/components/checkout/address/AddressCard";
import {
    lift,
    press,
    transitions,
} from "@/components/animations/Motion";

interface AddressListProps {
    addresses: Address[];
    selectedId?: string;
    onSelect: (address: Address) => void | Promise<void>;
    onEdit: (address: Address) => void | Promise<void>;
    onDelete: (address: Address) => void | Promise<void>;
    onAdd: () => void;
}

export default function AddressList({
    addresses,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onAdd,
}: AddressListProps) {
    if (addresses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-muted px-5 py-10 text-center sm:p-10"
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-md">
                    <MapPinPlus size={26} />
                </div>

                <h3 className="mt-5 text-heading-4 font-bold text-foreground">
                    No Saved Addresses
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-body leading-6 text-muted-foreground">
                    Add your first delivery address to continue with checkout.
                </p>

                <motion.button
                    type="button"
                    onClick={onAdd}
                    whileHover={lift.row}
                    whileTap={press.tap}
                    transition={transitions.micro}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-body-sm font-medium text-background shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Plus size={18} />
                    Add Address
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-heading-4 font-semibold text-foreground">
                        Saved Addresses
                    </h3>
                    <p className="mt-1 text-small text-muted-foreground sm:text-body-sm">
                        Choose where you want your order delivered.
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={onAdd}
                    whileHover={{ scale: 1.03 }}
                    whileTap={press.tap}
                    transition={transitions.micro}
                    aria-label="Add a new address"
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-body-sm font-medium transition hover:border-foreground hover:bg-foreground hover:text-background sm:px-4"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add New</span>
                </motion.button>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {addresses.map((address) => (
                        <motion.div
                            key={address.$id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12, scale: 0.98 }}
                            transition={transitions.normal}
                        >
                            <AddressCard
                                address={address}
                                selected={selectedId === address.$id}
                                onSelect={() => onSelect(address)}
                                onEdit={() => onEdit(address)}
                                onDelete={() => onDelete(address)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <motion.button
                type="button"
                onClick={onAdd}
                whileHover={lift.row}
                whileTap={press.tap}
                transition={transitions.micro}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted py-3.5 text-body-sm font-medium text-muted-foreground transition hover:border-foreground hover:bg-foreground hover:text-background sm:rounded-3xl"
            >
                <Plus size={18} />
                Add Another Address
            </motion.button>
        </div>
    );
}