"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Address, CreateAddressPayload } from "@/lib/types/address";

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

    const view = useMemo<ViewState>(() => {
        if (viewOverride) return viewOverride;
        if (addresses.length === 0) return "empty";
        if (selectedAddress) return "summary";
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
            selectedAddress ? "summary" : addresses.length > 0 ? "list" : "empty"
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

    const handleDelete = async (address: Address) => {
        await onDelete(address);
        if (selectedAddress?.$id === address.$id) {
            setViewOverride("list");
        }
    };

    return (
        <motion.section
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
        >
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center justify-between px-5 py-4 sm:px-6 sm:py-5"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-all duration-300 ${open
                                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                    >
                        <MapPin size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] sm:text-xs font-bold text-white">
                                1
                            </span>
                            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                                Delivery Address
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">
                            {selectedAddress
                                ? `${selectedAddress.fullName}, ${selectedAddress.city}`
                                : "Choose where your order should arrive"}
                        </p>
                    </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition group-hover:bg-zinc-200">
                    {open ? (
                        <ChevronDown size={18} className="text-zinc-500" />
                    ) : (
                        <ChevronRight size={18} className="text-zinc-500" />
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="address-body"
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-zinc-100"
                    >
                        <div className="p-5 sm:p-6">
                            <AnimatePresence mode="wait">
                                {view === "empty" && (
                                    <AddressEmpty
                                        key="empty"
                                        onAdd={() => {
                                            setEditingAddress(null);
                                            setViewOverride("form");
                                        }}
                                    />
                                )}

                                {view === "form" && (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <AddressForm
                                            initialData={editingAddress}
                                            onCancel={handleCancel}
                                            onSave={handleSave}
                                        />
                                    </motion.div>
                                )}

                                {view === "summary" && selectedAddress && (
                                    <motion.div
                                        key="summary"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-5"
                                    >
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
                                    </motion.div>
                                )}

                                {view === "list" && (
                                    <motion.div
                                        key="list"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <AddressList
                                            addresses={addresses}
                                            selectedId={selectedAddress?.$id}
                                            onSelect={handleSelect}
                                            onAdd={() => {
                                                setEditingAddress(null);
                                                setViewOverride("form");
                                            }}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!open && selectedAddress && (
                <div className="border-t border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                    <AddressSummary compact address={selectedAddress} onChange={onOpen} />
                </div>
            )}

            {!open && !selectedAddress && addresses.length === 0 && (
                <div className="border-t border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                    <button
                        type="button"
                        onClick={() => {
                            onOpen();
                            setViewOverride("form");
                        }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 transition hover:opacity-70"
                    >
                        <Plus size={16} />
                        Add Address
                    </button>
                </div>
            )}
        </motion.section>
    );
}

