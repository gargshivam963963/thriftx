"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import AddressList from "@/components/checkout/address/AddressList";
import { useAddresses } from "@/hooks/useAddresses";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import type { Address } from "@/lib/types/address";

export default function ProfileAddressesPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const {
        addresses,
        loading,
        deleteExistingAddress,
        setDefault,
    } = useAddresses(user?.id ?? "");

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile/addresses");
        }
    }, [authLoading, user, router]);

    const handleSelect = async (address: Address) => {
        await setDefault(address.$id);
        toast.success("Default address updated.");
    };

    const handleEdit = (address: Address) => {
        // Will integrate with edit form later
        toast.info("Edit coming soon.");
    };

    const handleDelete = async (address: Address) => {
        await deleteExistingAddress(address.$id);
        toast.success("Address removed.");
    };

    if (authLoading || !user) return null;

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-6 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <div className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                            <ArrowLeft size={14} />
                        </div>
                        Profile
                    </Link>
                </motion.div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Saved Addresses
                        </p>
                        <h1 className="font-display text-heading-3 font-bold tracking-tight text-foreground">
                            My Addresses
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-32 animate-pulse rounded-3xl bg-muted"
                            />
                        ))}
                    </div>
                ) : (
                    <AddressList
                        addresses={addresses}
                        selectedId={undefined}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={() => router.push("/checkout")}
                    />
                )}
            </div>
        </main>
    );
}

