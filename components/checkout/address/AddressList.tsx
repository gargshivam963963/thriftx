// components/checkout/address/AddressList.tsx

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
                className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                    <MapPinPlus size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-zinc-900">
                    No Saved Addresses
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
                    Add your first delivery address to continue your checkout.
                </p>

                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                    <Plus size={18} />
                    Add Address
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Saved Addresses
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                        Choose where you want your order delivered.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                >
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            <AnimatePresence mode="popLayout">
                {addresses.map((address) => (
                    <motion.div
                        key={address.$id}
                        layout
                        initial={{
                            opacity: 0,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -12,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
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

            <button
                type="button"
                onClick={onAdd}
                className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 py-5 text-sm font-medium text-zinc-700 transition hover:border-black hover:bg-black hover:text-white"
            >
                <Plus size={18} />
                Add Another Address
            </button>
        </div>
    );
}