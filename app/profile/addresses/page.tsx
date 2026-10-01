"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import AddressForm from "@/components/checkout/address/AddressForm";
import AddressList from "@/components/checkout/address/AddressList";
import { Button } from "@/components/ui/button";
import { useAddresses } from "@/hooks/useAddresses";
import { useAuth } from "@/lib/AuthContext";
import { getFriendlyError } from "@/lib/errors";
import type {
    Address,
    CreateAddressPayload,
} from "@/lib/types/address";

export default function ProfileAddressesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const {
        addresses,
        loading,
        error,
        fetchAddresses,
        createNewAddress,
        updateExistingAddress,
        deleteExistingAddress,
        setDefault,
    } = useAddresses(user?.id ?? "");

    const [formOpen, setFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login?redirect=/profile/addresses");
        }
    }, [authLoading, user, router]);

    const openCreateForm = useCallback(() => {
        setEditingAddress(null);
        setActionError("");
        setFormOpen(true);
    }, []);

    const openEditForm = useCallback((address: Address) => {
        setEditingAddress(address);
        setActionError("");
        setFormOpen(true);
    }, []);

    const closeForm = useCallback(() => {
        if (saving) return;
        setFormOpen(false);
        setEditingAddress(null);
        setActionError("");
    }, [saving]);

    const handleSave = async (
        data: CreateAddressPayload,
        addressId?: string
    ) => {
        setSaving(true);
        setActionError("");

        try {
            if (addressId) {
                await updateExistingAddress(addressId, data);
                toast.success("Address updated successfully.");
            } else {
                await createNewAddress(data);
                toast.success("Address saved successfully.");
            }

            setFormOpen(false);
            setEditingAddress(null);
        } catch (err) {
            const message = getFriendlyError(
                err,
                "Unable to save this address. Please try again."
            );

            setActionError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSelect = async (address: Address) => {
        try {
            await setDefault(address.$id);
            toast.success("Default address updated.");
        } catch (err) {
            toast.error(
                getFriendlyError(err, "Unable to update the default address.")
            );
        }
    };

    const handleDelete = async (address: Address) => {
        try {
            await deleteExistingAddress(address.$id);
            toast.success("Address removed.");
        } catch (err) {
            toast.error(
                getFriendlyError(err, "Unable to remove this address.")
            );
        }
    };

    if (authLoading || !user) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-5xl space-y-5">
                    <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
                    <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-6 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <span className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                            <ArrowLeft size={14} aria-hidden="true" />
                        </span>
                        Profile
                    </Link>
                </motion.div>

                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Delivery Preferences
                        </p>

                        <h1 className="font-display text-heading-3 font-bold tracking-tight text-foreground">
                            My Addresses
                        </h1>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Manage where your THRIFTX orders are delivered.
                        </p>
                    </div>

                    {!formOpen && (
                        <Button
                            type="button"
                            onClick={openCreateForm}
                            leftIcon={<Plus size={17} />}
                        >
                            Add Address
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {formOpen ? (
                        <motion.section
                            key={editingAddress?.$id ?? "new-address"}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                                    <MapPin size={18} aria-hidden="true" />
                                </div>

                                <div>
                                    <h2 className="text-body font-semibold text-foreground">
                                        {editingAddress
                                            ? "Edit Saved Address"
                                            : "Add Delivery Address"}
                                    </h2>
                                    <p className="text-small text-muted-foreground">
                                        Your address details are used for order
                                        delivery.
                                    </p>
                                </div>
                            </div>

                            {actionError && (
                                <p
                                    role="alert"
                                    className="mb-4 rounded-xl border border-error/30 bg-error-bg p-3 text-body-sm text-error-foreground"
                                >
                                    {actionError}
                                </p>
                            )}

                            <AddressForm
                                initialData={editingAddress}
                                onCancel={closeForm}
                                onSave={handleSave}
                            />
                        </motion.section>
                    ) : (
                        <motion.section
                            key="address-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            aria-label="Saved delivery addresses"
                        >
                            {loading ? (
                                <div
                                    className="space-y-4"
                                    aria-label="Loading saved addresses"
                                    role="status"
                                >
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="h-32 animate-pulse rounded-3xl bg-muted"
                                        />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                                    <p className="text-body-sm text-muted-foreground">
                                        We couldn&apos;t load your saved addresses.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => void fetchAddresses()}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            ) : (
                                <AddressList
                                    addresses={addresses}
                                    selectedId={undefined}
                                    onSelect={handleSelect}
                                    onEdit={openEditForm}
                                    onDelete={handleDelete}
                                    onAdd={openCreateForm}
                                />
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>

                {!formOpen && addresses.length > 0 && (
                    <p className="mt-6 text-center text-small text-muted-foreground">
                        Your saved addresses are available during checkout.
                    </p>
                )}
            </div>
        </main>
    );
}