import {
    Package,
    CircleCheck,
    TriangleAlert,
    Images,
    LoaderCircle,
} from "lucide-react";

interface StatsCardsProps {
    totalProducts: number;
    readyProducts: number;
    issues: number;
    totalImages: number;
    uploading?: boolean;
}

export default function StatsCards({
    totalProducts,
    readyProducts,
    issues,
    totalImages,
    uploading = false,
}: StatsCardsProps) {
    const stats = [
        {
            title: "Products",
            value: totalProducts,
            icon: Package,
            bg: "bg-blue-100",
            color: "text-blue-700",
        },
        {
            title: "Ready",
            value: readyProducts,
            icon: CircleCheck,
            bg: "bg-green-100",
            color: "text-green-700",
        },
        {
            title: "Issues",
            value: issues,
            icon: TriangleAlert,
            bg: "bg-red-100",
            color: "text-red-700",
        },
        {
            title: "Images",
            value: totalImages,
            icon: Images,
            bg: "bg-purple-100",
            color: "text-purple-700",
        },
    ];

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.title}
                        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm text-neutral-500">
                                    {item.title}
                                </p>

                                <h2 className="mt-2 text-4xl font-bold">
                                    {item.value}
                                </h2>

                            </div>

                            <div
                                className={`rounded-xl p-3 ${item.bg}`}
                            >
                                <Icon
                                    size={24}
                                    className={item.color}
                                />
                            </div>

                        </div>

                        <div className="mt-6">

                            {uploading ? (
                                <div className="flex items-center gap-2 text-sm text-blue-600">

                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Uploading...

                                </div>
                            ) : item.title === "Issues" ? (
                                <p
                                    className={`text-sm ${issues
                                        ? "text-red-600"
                                        : "text-green-600"
                                        }`}
                                >
                                    {issues
                                        ? "Needs Attention"
                                        : "No Issues Found"}
                                </p>
                            ) : item.title === "Ready" ? (
                                <p className="text-sm text-green-600">
                                    Ready For Upload
                                </p>
                            ) : item.title === "Products" ? (
                                <p className="text-sm text-neutral-500">
                                    Excel Records
                                </p>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Total Images Found
                                </p>
                            )}

                        </div>

                    </div>
                );
            })}

        </div>
    );
}