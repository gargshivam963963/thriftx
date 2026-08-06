"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Plus,
    Sparkles,
    PartyPopper,
    Clock,
    Zap,
    Gift,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Address, CreateAddressPayload } from "@/lib/types/address";
import { detectDeliveryZone } from "@/lib/delivery";

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

    const [showPanipatModal, setShowPanipatModal] = useState(false);
    const [panipatAddress, setPanipatAddress] = useState<Address | null>(null);

    const view = useMemo<ViewState>(() => {
        if (viewOverride) return viewOverride;
        if (addresses.length === 0) return "empty";
        if (selectedAddress) return "summary";
        return "list";
    }, [addresses.length, selectedAddress, viewOverride]);

    const handleSave = async (
        data: CreateAddressPayload,
        addressId?: string,
    ) => {
        await onSave(data, addressId);
        setEditingAddress(null);
        setViewOverride("summary");

        // Show Panipat celebration if city matches
        if (detectDeliveryZone(data.city, data.pincode) === "local") {
            const newAddr: Address = {
                $id: addressId || "temp",
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                userId: "",
                fullName: data.fullName,
                phone: data.phone,
                alternatePhone: data.alternatePhone || "",
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || "",
                landmark: data.landmark || "",
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                type: data.type,
                isDefault: true,
            };
            setPanipatAddress(newAddr);
            setShowPanipatModal(true);
        }
    };

    const handleCancel = () => {
        setEditingAddress(null);
        setViewOverride(
            selectedAddress
                ? "summary"
                : addresses.length > 0
                    ? "list"
                    : "empty",
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
            setViewOverride(addresses.length > 1 ? "list" : "empty");
        }
    };

    return (
        <motion.section
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl"
        >
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${open
                            ? "bg-foreground text-white shadow-lg shadow-foreground/20"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        <MapPin size={18} className="sm:h-[20px] sm:w-[20px]" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                                1
                            </span>
                            <h2 className="text-sm font-semibold text-foreground sm:text-base sm:text-lg">
                                Delivery Address
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                            {selectedAddress
                                ? `${selectedAddress.fullName}, ${selectedAddress.city}`
                                : "Choose where your order should arrive"}
                        </p>
                    </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition">
                    {open ? (
                        <ChevronDown size={18} className="text-muted-foreground" />
                    ) : (
                        <ChevronRight size={18} className="text-muted-foreground" />
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
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="p-4 sm:p-6">
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
                                        className="space-y-4 sm:space-y-5"
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
                                            className="rounded-xl sm:rounded-2xl"
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
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <AddressSummary
                        compact
                        address={selectedAddress}
                        onChange={onOpen}
                    />
                </div>
            )}

            {!open && !selectedAddress && addresses.length === 0 && (
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <button
                        type="button"
                        onClick={() => {
                            onOpen();
                            setViewOverride("form");
                        }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:opacity-70"
                    >
                        <Plus size={16} />
                        Add Address
                    </button>
                </div>
            )}

            {/* ─── Panipat Celebration Modal ─────────────────────── */}
            <AnimatePresence>
                {showPanipatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowPanipatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 22 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-400 p-0 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative */}
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />

                            <div className="relative z-10 px-6 pb-6 pt-10 text-center sm:px-8 sm:pb-8 sm:pt-14">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 sm:h-24 sm:w-24"
                                >
                                    <PartyPopper size={40} className="text-white sm:h-[48px] sm:w-[48px]" />
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="mt-5 font-display text-2xl font-bold text-white sm:mt-6 sm:text-3xl"
                                >
                                    🎉 Congratulations!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-2 text-sm leading-6 text-white/80 sm:text-base"
                                >
                                    You&apos;re in <strong>Panipat</strong> — you automatically get
                                    exclusive perks! 🚀
                                </motion.p>

                                {/* Perks */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="mt-5 space-y-2.5 text-left sm:mt-6"
                                >
                                    {[
                                        { icon: Zap, text: "FREE same-day delivery (30–60 mins)" },
                                        { icon: Clock, text: "Lightning-fast dispatch", },
                                        { icon: Gift, text: "Exclusive Panipat offers & perks" },
                                    ].map((perk, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                                                <perk.icon size={16} className="text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white">{perk.text}</span>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setShowPanipatModal(false)}
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50 sm:mt-7"
                                    >
                                        <Sparkles size={16} />
                                        Awesome! Let&apos;s Go
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}

