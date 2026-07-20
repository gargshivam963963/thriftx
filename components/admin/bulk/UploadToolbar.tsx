"use client";

import { Search, Filter, Sparkles } from "lucide-react";

export default function UploadToolbar() {
    return (
        <div className="rounded-2xl border bg-white p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative w-full lg:max-w-md">

                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={18}
                    />

                    <input
                        placeholder="Search SKU, Brand or Product..."
                        className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-black"
                    />

                </div>

                <div className="flex gap-3">

                    <button className="flex items-center gap-2 rounded-xl border px-4 py-3 hover:bg-neutral-100">

                        <Filter size={18} />

                        Filters

                    </button>

                    <button className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-white hover:bg-neutral-800">

                        <Sparkles size={18} />

                        Generate AI

                    </button>

                </div>

            </div>

        </div>
    );
}