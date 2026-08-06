"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import type { WalletBalance as WalletBalanceType } from "@/lib/marketing/types";

export default function WalletBalance() {
    const [wallet, setWallet] = useState<WalletBalanceType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/credits");
                const data = await res.json();
                if (active && data.success && data.wallet) {
                    setWallet(data.wallet);
                }
            } catch (error) {
                console.error("Failed to load wallet:", error);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        );
    }

    if (!wallet) return null;

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-muted to-muted p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                <Wallet size={22} />
            </div>
            <div>
                <p className="text-badge font-bold uppercase tracking-wider text-muted-foreground">
                    ThriftX Credits
                </p>
                <p className="text-heading-3 font-bold text-foreground">
                    ₹{wallet.balance.toLocaleString("en-IN")}
                </p>
                <p className="text-small text-muted-foreground">
                    Available to use at checkout
                </p>
            </div>
        </div>
    );
}
