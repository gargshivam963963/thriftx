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
                className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center dark:border-neutral-800 dark:bg-neutral-900/70"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
                >
                    <MapPinPlus size={26} />
                </motion.div>

                <h3 className="mt-5 font-bold text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    No Saved Addresses
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Add your first delivery address to continue with your checkout.
                </p>

                <motion.button
                    type="button"
                    onClick={onAdd}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 transition hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
                >
                    <Plus size={18} />
                    Add Address
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
                        Saved Addresses
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                        Choose where you want your order delivered.
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={onAdd}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white sm:px-4 sm:py-2.5 dark:border-neutral-700 dark:hover:border-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
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
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16, scale: 0.95 }}
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-3.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white sm:rounded-3xl sm:py-4 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:border-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
            >
                <Plus size={18} />
                Add Another Address
            </motion.button>
        </div>
    );
}

