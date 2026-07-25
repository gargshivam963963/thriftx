import { Package, CircleCheck, TriangleAlert, Images } from "lucide-react";

interface StatsCardsProps {
    totalProducts: number;
    readyProducts: number;
    issues: number;
    totalImages: number;
    uploading?: boolean;
}

const items = [
    { key: "products", label: "Products", icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { key: "ready", label: "Ready", icon: CircleCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { key: "issues", label: "Issues", icon: TriangleAlert, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
    { key: "images", label: "Images", icon: Images, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

export default function StatsCards({
    totalProducts,
    readyProducts,
    issues,
    totalImages,
}: StatsCardsProps) {
    const values: Record<string, number> = {
        products: totalProducts,
        ready: readyProducts,
        issues,
        images: totalImages,
    };

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-neutral-200/70 bg-white px-4 py-3 dark:border-neutral-700/50 dark:bg-neutral-900"
                    >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                            <Icon size={18} className={item.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.label}</p>
                            <p className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{values[item.key]}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

