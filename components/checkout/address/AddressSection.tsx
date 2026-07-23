"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
    Address,
    CreateAddressPayload,
} from "@/lib/types/address";

import AddressEmpty from "./AddressEmpty";
import AddressForm from "./AddressForm";
import AddressSummary from "./AddressSummary";
import AddressList from "./AddressList";

interface AddressSectionProps {
    open: boolean;
    addresses: Address[];
    selectedAddress: Address | null;
    onSave: (data: CreateAddressPayload, addressId?: string) => Promise<void>;
    onSelect: (address: Address) => void | Promise<void>;
    onDelete: (address: Address) => void | Promise<void>;
    onOpen: () => void;
    onContinue: () => void;
}

type ViewState = "empty" | "form" | "summary" | "list";

export default function AddressSection({
    open,
    addresses,
    selectedAddress,
    onSave,
    onSelect,
    onDelete,
    onOpen,
    onContinue,
}: AddressSectionProps) {
    const [viewOverride, setViewOverride] = useState<ViewState | null>(null);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] =
        useState<Address | null>(null);

    const handleDeleteClick = (address: Address) => {
        setAddressToDelete(address);
        setShowDeleteDialog(true);
    };

    const view = useMemo<ViewState>(() => {
        if (viewOverride) {
            return viewOverride;
        }

        if (addresses.length === 0) {
            return "empty";
        }

        if (selectedAddress) {
            return "summary";
        }

        return "list";
    }, [addresses.length, selectedAddress, viewOverride]);

    const handleSave = async (data: CreateAddressPayload, addressId?: string) => {
        await onSave(data, addressId);
        setEditingAddress(null);
        setViewOverride("summary");
    };

    const handleCancel = () => {
        setEditingAddress(null);
        setViewOverride(
            selectedAddress ? "summary" : addresses.length > 0 ? "list" : "empty",
        );
    };

    const handleSelect = async (address: Address) => {
        await onSelect(address);
        setViewOverride("summary");
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setViewOverride("form");
    };

    return (
        <motion.section
            layout
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
        >
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center justify-between px-6 py-5"
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${open
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-600"
                            }`}
                    >
                        <MapPin size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                1
                            </span>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Delivery Address
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            {selectedAddress
                                ? "Delivering to this address"
                                : "Choose where your order should arrive"}
                        </p>
                    </div>
                </div>

                {open ? (
                    <ChevronDown className="text-neutral-500" size={22} />
                ) : (
                    <ChevronRight className="text-neutral-500" size={22} />
                )}
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="address-body"
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-neutral-100"
                    >
                        <div className="p-6">
                            {view === "empty" && (
                                <AddressEmpty
                                    onAdd={() => {
                                        setEditingAddress(null);
                                        setViewOverride("form");
                                    }}
                                />
                            )}

                            {view === "form" && (
                                <AddressForm
                                    initialData={editingAddress}
                                    onCancel={handleCancel}
                                    onSave={handleSave}
                                />
                            )}

                            {view === "summary" && selectedAddress && (
                                <div className="space-y-5">
                                    <AddressSummary
                                        address={selectedAddress}
                                        onChange={() => setViewOverride("list")}
                                    />
                                    <Button
                                        type="button"
                                        onClick={onContinue}
                                        fullWidth
                                        size="lg"
                                        className="rounded-2xl"
                                    >
                                        Continue to Shipping
                                    </Button>
                                </div>
                            )}

                            {view === "list" && (
                                <AddressList
                                    addresses={addresses}
                                    selectedId={selectedAddress?.$id}
                                    onSelect={handleSelect}
                                    onAdd={() => {
                                        setEditingAddress(null);
                                        setViewOverride("form");
                                    }}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!open && selectedAddress && (
                <div className="border-t border-neutral-100 px-6 py-5">
                    <AddressSummary
                        compact
                        address={selectedAddress}
                        onChange={onOpen}
                    />
                </div>
            )}

            {!open && !selectedAddress && addresses.length === 0 && (
                <div className="border-t border-neutral-100 px-6 py-5">
                    <button
                        type="button"
                        onClick={() => {
                            onOpen();
                            setViewOverride("form");
                        }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-black transition hover:opacity-70"
                    >
                        <Plus size={16} />
                        Add Address
                    </button>

                    <AnimatePresence>
                        {showDeleteDialog && (
                            <motion.div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                                >
                                    <h2 className="text-xl font-semibold text-zinc-900">
                                        Delete Address?
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                                        Are you sure you want to delete this address?
                                        This action cannot be undone.
                                    </p>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeleteDialog(false);
                                                setAddressToDelete(null);
                                            }}
                                            className="rounded-xl border border-zinc-300 px-5 py-2.5 font-medium hover:bg-zinc-100"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!addressToDelete) return;

                                                // We'll call the actual delete function here
                                                // after wiring onDelete from CheckoutAccordion.

                                                setShowDeleteDialog(false);
                                                setAddressToDelete(null);
                                            }}
                                            className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.section>
    );
}
