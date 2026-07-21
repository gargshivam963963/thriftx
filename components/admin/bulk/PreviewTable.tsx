"use client";

import { useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    createColumnHelper,
} from "@tanstack/react-table";
import Image from "next/image";

export interface BulkPreviewProduct {
    sku: string;
    image: string;
    brand: string;
    title: string;
    category: string;
    price: number;
    status: string;
    ai: string;
}

interface PreviewTableProps {
    data: BulkPreviewProduct[];
}

const columnHelper =
    createColumnHelper<BulkPreviewProduct>();

export default function PreviewTable({
    data,
}: PreviewTableProps) {
    const [selected, setSelected] =
        useState<Record<string, boolean>>({});

    const columns = useMemo(
        () => [
            columnHelper.display({
                id: "select",

                header: () => (
                    <input
                        type="checkbox"
                        onChange={(e) => {
                            if (e.target.checked) {
                                const obj: Record<
                                    string,
                                    boolean
                                > = {};

                                data.forEach((item) => {
                                    obj[item.sku] = true;
                                });

                                setSelected(obj);
                            } else {
                                setSelected({});
                            }
                        }}
                    />
                ),

                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={
                            selected[
                            row.original.sku
                            ] ?? false
                        }
                        onChange={(e) =>
                            setSelected((prev) => ({
                                ...prev,
                                [row.original.sku]:
                                    e.target.checked,
                            }))
                        }
                    />
                ),
            }),

            columnHelper.accessor("image", {
                header: "Image",

                cell: (info) => (
                    <Image
                        src={info.getValue()}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className="h-14 w-14 rounded-lg object-cover"
                    />
                ),
            }),

            columnHelper.accessor("sku", {
                header: "SKU",
            }),

            columnHelper.accessor("brand", {
                header: "Brand",
            }),

            columnHelper.accessor("title", {
                header: "Title",
            }),

            columnHelper.accessor("category", {
                header: "Category",
            }),

            columnHelper.accessor("price", {
                header: "Price",

                cell: (info) => (
                    <>₹{info.getValue()}</>
                ),
            }),

            columnHelper.accessor("status", {
                header: "Status",

                cell: (info) => (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold

${info.getValue() === "Ready"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {info.getValue()}
                    </span>
                ),
            }),

            columnHelper.accessor("ai", {
                header: "AI",

                cell: (info) => (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold

${info.getValue() ===
                                "Generated"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {info.getValue()}
                    </span>
                ),
            }),
        ],
        [data, selected]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel:
            getCoreRowModel(),
    });

    return (
        <div className="overflow-hidden rounded-2xl border bg-white">

            <div className="border-b p-5">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-semibold">
                            Product Preview
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Review products before
                            upload
                        </p>

                    </div>

                    <div className="rounded-xl bg-neutral-100 px-4 py-2">

                        <p className="text-xs text-neutral-500">
                            Products
                        </p>

                        <p className="font-bold">
                            {data.length}
                        </p>

                    </div>

                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead className="bg-neutral-100">

                        {table
                            .getHeaderGroups()
                            .map((group) => (
                                <tr
                                    key={group.id}
                                >
                                    {group.headers.map(
                                        (
                                            header
                                        ) => (
                                            <th
                                                key={
                                                    header.id
                                                }
                                                className="p-4 text-left"
                                            >
                                                {flexRender(
                                                    header
                                                        .column
                                                        .columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        )
                                    )}
                                </tr>
                            ))}

                    </thead>

                    <tbody>

                        {table
                            .getRowModel()
                            .rows.map((row) => (
                                <tr
                                    key={
                                        row.id
                                    }
                                    className="border-t hover:bg-neutral-50"
                                >
                                    {row
                                        .getVisibleCells()
                                        .map(
                                            (
                                                cell
                                            ) => (
                                                <td
                                                    key={
                                                        cell.id
                                                    }
                                                    className="p-4"
                                                >
                                                    {flexRender(
                                                        cell
                                                            .column
                                                            .columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            )
                                        )}
                                </tr>
                            ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}