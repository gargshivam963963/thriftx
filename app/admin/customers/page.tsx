"use client";


import { Button } from '@/components/ui/button'; import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Users,
    Mail,
    Phone,
    ShoppingBag,
    MapPin,
    Download,
    ArrowUpDown,
    Calendar,
    IndianRupee,
} from "lucide-react";
import type { CustomerData } from "@/lib/services/adminService";

// API helper
async function apiGetCustomers(): Promise<CustomerData[]> {
    const res = await fetch('/api/admin/customers');
    if (!res.ok) return [];
    const json = await res.json();
    return json?.customers ?? [];
}
import { cn } from "@/lib/utils";
import AdminPage from "@/components/admin/AdminPage";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<"totalSpent" | "totalOrders" | "name">("totalSpent");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGetCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const filteredCustomers = useMemo(() => {
        if (!search.trim()) return customers;

        const q = search.toLowerCase();
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.phone.includes(q) ||
                c.city.toLowerCase().includes(q),
        );
    }, [customers, search]);

    const sortedCustomers = useMemo(() => {
        return [...filteredCustomers].sort((a, b) => {
            let comparison = 0;
            if (sortField === "totalSpent") {
                comparison = a.totalSpent - b.totalSpent;
            } else if (sortField === "totalOrders") {
                comparison = a.totalOrders - b.totalOrders;
            } else {
                comparison = a.name.localeCompare(b.name);
            }
            return sortDir === "desc" ? -comparison : comparison;
        });
    }, [filteredCustomers, sortField, sortDir]);

    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Phone", "City", "Orders", "Total Spent", "Last Order", "Joined"];
        const rows = sortedCustomers.map((c) => [
            c.name,
            c.email,
            c.phone,
            c.city,
            c.totalOrders,
            c.totalSpent,
            c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-IN") : "N/A",
            new Date(c.joinedAt).toLocaleDateString("en-IN"),
        ]);

        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `thriftx-customers-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AdminPage width="wide">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Customers
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {customers.length} total customers
                    </p>
                </div>
                <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                >
                    <Download size={16} />
                    Export CSV
                </Button>
            </motion.div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                    type="text"
                    placeholder="Search by name, email, phone or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                />
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="admin-card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Location
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground"
                                    onClick={() => toggleSort("totalOrders")}
                                >
                                    <div className="flex items-center gap-1">
                                        Orders <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground"
                                    onClick={() => toggleSort("totalSpent")}
                                >
                                    <div className="flex items-center gap-1">
                                        Total Spent <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Last Order
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : sortedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Users size={32} className="mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {search ? "No customers match your search" : "No customers found"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                sortedCustomers.map((customer, i) => (
                                    <tr
                                        key={customer.$id}
                                        className={cn(
                                            "border-b border-border transition-all hover:bg-muted cursor-pointer",
                                            i % 2 === 0 ? "bg-transparent" : "bg-muted/30",
                                        )}
                                        onClick={() => setSelectedCustomer(customer)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-xs font-bold text-white dark:from-zinc-300 dark:to-zinc-500 dark:text-black">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-foreground">
                                                    {customer.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Mail size={12} />
                                                    {customer.email || "—"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone size={12} />
                                                    {customer.phone || "—"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin size={12} />
                                                {customer.city}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-foreground">
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-foreground">
                                                ₹{customer.totalSpent.toLocaleString("en-IN")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {customer.lastOrderDate
                                                ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(customer.joinedAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                {!loading && sortedCustomers.length > 0 && (
                    <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                        Showing {sortedCustomers.length} of {customers.length} customers
                    </div>
                )}
            </motion.div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedCustomer(null)}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-xl font-bold text-white dark:from-zinc-300 dark:to-zinc-500 dark:text-black">
                                {selectedCustomer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {selectedCustomer.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedCustomer.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Phone
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {selectedCustomer.phone || "—"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    City
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {selectedCustomer.city}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Orders
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {selectedCustomer.totalOrders}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted p-3">
                                <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Spent
                                </p>
                                <p className="mt-1 font-semibold text-foreground">
                                    ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={() => setSelectedCustomer(null)}
                                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AdminPage>
    );
}
