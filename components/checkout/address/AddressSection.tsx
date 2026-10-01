
"use client";

import { useMemo, useState } from "react";
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
    CheckCircle2,
    Check,
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
    onSave: (
        data: CreateAddressPayload,
        addressId?: string,
    ) => Promise<void>;
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
    const [viewOverride, setViewOverride] =
        useState<ViewState | null>(null);

    const [editingAddress, setEditingAddress] =
        useState<Address | null>(null);

    const [showPanipatModal, setShowPanipatModal] =
        useState(false);

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

        if (
            detectDeliveryZone(data.city, data.pincode) === "local"
        ) {
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
            setViewOverride(
                addresses.length > 1 ? "list" : "empty",
            );
        }
    };

    const openAddressForm = () => {
        setEditingAddress(null);
        setViewOverride("form");
    };

    return (
        <motion.section
            layout
            transition={{
                duration: 0.28,
                ease: "easeOut",
            }}
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md sm:rounded-3xl"
        >
            {/* Section header */}
            <button
                type="button"
                onClick={onOpen}
                aria-expanded={open}
                aria-controls="checkout-address-content"
                className={[
                    "group flex w-full min-w-0 items-center justify-between gap-3",
                    "bg-card px-4 py-4 text-left transition-colors",
                    "hover:bg-muted/30 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
                    "sm:px-6 sm:py-5",
                ].join(" ")}
            >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div
                        className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            "transition-colors duration-200 sm:h-12 sm:w-12 sm:rounded-2xl",
                            selectedAddress
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : open
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground",
                        ].join(" ")}
                    >
                        {selectedAddress ? (
                            <CheckCircle2
                                size={20}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        ) : (
                            <MapPin
                                size={19}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={[
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                    "text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs",
                                    selectedAddress
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                        : "bg-muted text-muted-foreground",
                                ].join(" ")}
                            >
                                {selectedAddress ? (
                                    <Check size={12} />
                                ) : (
                                    "1"
                                )}
                            </span>

                            <h2 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                Delivery Address
                            </h2>

                            {selectedAddress && (
                                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:inline-flex">
                                    Completed
                                </span>
                            )}
                        </div>

                        <p className="mt-1 max-w-[220px] truncate text-xs leading-relaxed text-muted-foreground sm:max-w-md sm:text-sm">
                            {selectedAddress
                                ? `${selectedAddress.fullName}, ${selectedAddress.city}`
                                : "Choose where your order should arrive"}
                        </p>
                    </div>
                </div>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground sm:h-9 sm:w-9">
                    {open ? (
                        <ChevronDown
                            size={17}
                            aria-hidden="true"
                        />
                    ) : (
                        <ChevronRight
                            size={17}
                            aria-hidden="true"
                        />
                    )}
                </span>
            </button>

            {/* Expanded address content */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id="checkout-address-content"
                        key="address-body"
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                        }}
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="p-4 sm:p-6">
                            <AnimatePresence mode="wait">
                                {view === "empty" && (
                                    <motion.div
                                        key="empty"
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                        }}
                                    >
                                        <AddressEmpty
                                            onAdd={openAddressForm}
                                        />
                                    </motion.div>
                                )}

                                {view === "form" && (
                                    <motion.div
                                        key="form"
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        <AddressForm
                                            initialData={editingAddress}
                                            onCancel={handleCancel}
                                            onSave={handleSave}
                                        />
                                    </motion.div>
                                )}

                                {view === "summary" &&
                                    selectedAddress && (
                                        <motion.div
                                            key="summary"
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -8,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className="space-y-4 sm:space-y-5"
                                        >
                                            <AddressSummary
                                                address={selectedAddress}
                                                onChange={() =>
                                                    setViewOverride("list")
                                                }
                                            />

                                            <Button
                                                type="button"
                                                onClick={onContinue}
                                                fullWidth
                                                size="lg"
                                                className="h-12 rounded-xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.99] sm:h-13 sm:rounded-2xl"
                                            >
                                                Continue to Shipping
                                                <ChevronRight
                                                    size={17}
                                                    className="ml-1"
                                                    aria-hidden="true"
                                                />
                                            </Button>

                                            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                                                You can review your delivery
                                                method before placing your
                                                order.
                                            </p>
                                        </motion.div>
                                    )}

                                {view === "list" && (
                                    <motion.div
                                        key="list"
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                    >
                                        <AddressList
                                            addresses={addresses}
                                            selectedId={selectedAddress?.$id}
                                            onSelect={handleSelect}
                                            onAdd={openAddressForm}
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

            {/* Collapsed selected address */}
            {!open && selectedAddress && (
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <AddressSummary
                        compact
                        address={selectedAddress}
                        onChange={onOpen}
                    />
                </div>
            )}

            {/* Collapsed empty state */}
            {!open &&
                !selectedAddress &&
                addresses.length === 0 && (
                    <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                        <button
                            type="button"
                            onClick={() => {
                                onOpen();
                                openAddressForm();
                            }}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                        >
                            <Plus size={16} aria-hidden="true" />
                            Add Address
                        </button>
                    </div>
                )}

            {/* Panipat local delivery promotion */}
            <AnimatePresence>
                {showPanipatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowPanipatModal(false)}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="panipat-promo-title"
                            initial={{
                                scale: 0.96,
                                opacity: 0,
                                y: 16,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                scale: 0.96,
                                opacity: 0,
                                y: 16,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                            }}
                            className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-500 shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                            <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl" />

                            <div className="relative z-10 px-6 pb-6 pt-9 text-center sm:px-8 sm:pb-8 sm:pt-11">
                                <motion.div
                                    initial={{ scale: 0.7 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: 0.1,
                                        type: "spring",
                                        stiffness: 220,
                                    }}
                                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/15 sm:h-20 sm:w-20"
                                >
                                    <PartyPopper
                                        size={34}
                                        className="text-white sm:h-10 sm:w-10"
                                        aria-hidden="true"
                                    />
                                </motion.div>

                                <motion.h2
                                    id="panipat-promo-title"
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{ delay: 0.15 }}
                                    className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                                >
                                    🎉 Congratulations!
                                </motion.h2>

                                <motion.p
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{ delay: 0.2 }}
                                    className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/85 sm:text-base"
                                >
                                    Your delivery address is in{" "}
                                    <strong className="font-semibold text-white">
                                        Panipat
                                    </strong>
                                    . Your order qualifies for local delivery
                                    perks.
                                </motion.p>

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{ delay: 0.25 }}
                                    className="mt-5 space-y-2.5 text-left sm:mt-6"
                                >
                                    {[
                                        {
                                            icon: Zap,
                                            text: "FREE same-day home delivery",
                                        },
                                        {
                                            icon: Clock,
                                            text: "Estimated delivery in 2–3 hours",
                                        },
                                        {
                                            icon: Gift,
                                            text: "Exclusive Panipat offers and perks",
                                        },
                                    ].map((perk) => (
                                        <div
                                            key={perk.text}
                                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 backdrop-blur-sm sm:px-4"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                                <perk.icon
                                                    size={17}
                                                    className="text-white"
                                                    aria-hidden="true"
                                                />
                                            </div>

                                            <span className="text-sm font-medium leading-snug text-white">
                                                {perk.text}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowPanipatModal(false)
                                        }
                                        className="mt-6 h-11 rounded-xl bg-white px-7 text-sm font-semibold text-emerald-800 shadow-lg transition-colors hover:bg-emerald-50 sm:mt-7"
                                    >
                                        <Sparkles
                                            size={16}
                                            className="mr-2"
                                            aria-hidden="true"
                                        />
                                        Awesome! Let&apos;s Go
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}