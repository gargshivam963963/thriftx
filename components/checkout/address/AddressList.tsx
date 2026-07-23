"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPinPlus, Plus } from "lucide-react";

import type { Address } from "@/lib/types/address";
import AddressCard from "@/components/checkout/address/AddressCard";

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
                className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center"
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md">
                    <MapPinPlus size={26} />
                </div>

                <h3 className="mt-5 font-serif text-xl font-semibold text-zinc-900">
                    No Saved Addresses
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                    Add your first delivery address to continue with your checkout.
                </p>

                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                    <Plus size={18} />
                    Add Address
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Saved Addresses
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                        Choose where you want your order delivered.
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={onAdd}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add New</span>
                </motion.button>
            </div>

            {/* Address Cards */}
            <AnimatePresence mode="popLayout">
                {addresses.map((address) => (
                    <motion.div
                        key={address.$id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
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

            {/* Add Another Button */}
            <motion.button
                type="button"
                onClick={onAdd}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 py-4 text-sm font-medium text-zinc-600 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
            >
                <Plus size={18} />
                Add Another Address
            </motion.button>
        </div>
    );
}

