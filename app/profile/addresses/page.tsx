"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    } = useAddresses(user?.$id ?? "");

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
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
                    >
                        <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                            <ArrowLeft size={14} />
                        </div>
                        Profile
                    </Link>
                </motion.div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                            Saved Addresses
                        </p>
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            My Addresses
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-32 animate-pulse rounded-3xl bg-zinc-100"
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

