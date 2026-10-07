"use client";

import { ShieldCheck, Sparkles, Zap, BadgeCheck } from "lucide-react";

import { Container } from "@/components/ui/Container";

const features = [
    { icon: ShieldCheck, label: "Quality Checked" },
    { icon: Sparkles, label: "Premium Brands" },
    { icon: Zap, label: "Panipat Same-Day", highlight: true },
    { icon: BadgeCheck, label: "Trusted Shopping" },
];

export default function TrustStrip() {
    return (
        <section className="border-y border-white/40 bg-card/50 dark:border-white/10">
            <Container>
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 sm:py-8">
                    {features.map(({ icon: Icon, label, highlight }) => (
                        <div
                            key={label}
                            className={`inline-flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${highlight
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "text-muted-foreground"
                                }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="text-body font-semibold whitespace-nowrap">{label}</span>
                            {highlight && (
                                <span className="ml-1 rounded-full bg-emerald-200 px-1.5 py-0.5 text-badge font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                    🏆
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}

