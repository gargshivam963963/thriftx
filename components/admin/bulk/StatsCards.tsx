import { Package, CheckCircle2, AlertTriangle, ImageIcon } from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

interface StatsCardsProps {
    totalProducts: number;
    readyProducts: number;
    issues: number;
    totalImages: number;
    uploading?: boolean;
}

const items = [
    {
        key: "products",
        label: "Products",
        icon: Package,
        value: (s: StatsCardsProps) => s.totalProducts,
        accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
        key: "ready",
        label: "Ready",
        icon: CheckCircle2,
        value: (s: StatsCardsProps) => s.readyProducts,
        accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
        key: "issues",
        label: "Issues",
        icon: AlertTriangle,
        value: (s: StatsCardsProps) => s.issues,
        accent: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
        key: "images",
        label: "Images",
        icon: ImageIcon,
        value: (s: StatsCardsProps) => s.totalImages,
        accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
];

export default function StatsCards(props: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;
                const val = item.value(props);
                return (
                    <Card key={item.key} className="shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.accent}`}>
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                                <p className="text-xl font-bold tracking-tight text-foreground">{val}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
