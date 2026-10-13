"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Users,
    Download,
    MapPin,
    Clock,
    ShieldCheck,
} from "lucide-react";

import AdminPage from "@/components/admin/AdminPage";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import type { RegisteredUser } from "@/lib/services/adminService";

async function apiGetUsers(): Promise<RegisteredUser[]> {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return [];
    const json = await res.json();
    return json?.users ?? [];
}

type SortField = "createdAt" | "name" | "totalOrders" | "totalSpent";

function formatDate(value: string | null): string {
    if (!value) return "Never";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGetUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error loading registered users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.city || "").toLowerCase().includes(q) ||
                (u.state || "").toLowerCase().includes(q),
        );
    }, [users, search]);

    const sortedUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            let comparison = 0;
            if (sortField === "name") {
                comparison = a.name.localeCompare(b.name);
            } else if (sortField === "totalOrders") {
                comparison = a.totalOrders - b.totalOrders;
            } else if (sortField === "totalSpent") {
                comparison = a.totalSpent - b.totalSpent;
            } else {
                comparison =
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return sortDir === "desc" ? -comparison : comparison;
        });
    }, [filteredUsers, sortField, sortDir]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "Name",
            "Email",
            "Role",
            "Verified",
            "City",
            "State",
            "Orders",
            "Total Spent",
            "Last Active",
            "Joined",
        ];
        const rows = sortedUsers.map((u) => [
            u.name,
            u.email,
            u.role,
            u.emailVerified ? "Yes" : "No",
            u.city || "",
            u.state || "",
            u.totalOrders,
            u.totalSpent,
            u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString("en-IN") : "Never",
            new Date(u.createdAt).toLocaleDateString("en-IN"),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `thriftx-users-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AdminPage width="wide">
            <PageHeader
                title="Registered Users"
                icon={<Users className="text-sky-500" />}
                description={`${users.length} registered account${users.length === 1 ? "" : "s"} — including users who never placed an order`}
                actions={
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handleExportCSV}
                        leftIcon={<Download size={15} />}
                    >
                        Export CSV
                    </Button>
                }
            />

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                    type="text"
                    placeholder="Search by name, email, city or state..."
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
                                    User
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Location
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                    onClick={() => toggleSort("totalOrders")}
                                >
                                    Orders
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                    onClick={() => toggleSort("totalSpent")}
                                >
                                    Total Spent
                                </th>
                                <th className="px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Last Active
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-badge font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                    onClick={() => toggleSort("createdAt")}
                                >
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td colSpan={7} className="px-4 py-3">
                                            <div className="h-5 animate-pulse rounded bg-muted" />
                                        </td>
                                    </tr>
                                ))
                            ) : sortedUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No users found{search ? ` for "${search}"` : ""}
                                    </td>
                                </tr>
                            ) : (
                                sortedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border transition hover:bg-subtle dark:hover:bg-card/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-sm font-bold text-white">
                                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                                                        {user.name || "Unnamed user"}
                                                        {user.online && (
                                                            <span
                                                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                                                                title="Online now"
                                                            />
                                                        )}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                        {!user.emailVerified && (
                                                            <span className="ml-1.5 rounded bg-amber-50 px-1 py-0.5 text-2xs font-medium text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                                                unverified
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                                                    user.role === "admin"
                                                        ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                                                        : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                {user.role === "admin" && <ShieldCheck size={10} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {user.city || user.state ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {[user.city, user.state].filter(Boolean).join(", ")}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            {user.totalOrders}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            ₹{user.totalSpent.toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatDate(user.lastActiveAt)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && sortedUsers.length > 0 && (
                    <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                        Showing {sortedUsers.length} of {users.length} users
                    </div>
                )}
            </motion.div>
        </AdminPage>
    );
}
