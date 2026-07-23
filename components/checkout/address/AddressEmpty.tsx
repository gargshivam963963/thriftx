// components/checkout/address/AddressEmpty.tsx

"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Plus } from "lucide-react";

interface AddressEmptyProps {
    onAdd: () => void;
}

export default function AddressEmpty({
    onAdd,
}: AddressEmptyProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -12,
            }}
            transition={{
                duration: 0.25,
            }}
            className="flex flex-col items-center rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-white px-8 py-14"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg">
                <MapPin size={34} />
            </div>

            <h3 className="mt-7 text-2xl font-semibold tracking-tight text-zinc-900">
                Add your delivery address
            </h3>

            <p className="mt-3 max-w-md text-center text-sm leading-7 text-zinc-500">
                Save your address once for a faster checkout next
                time.
            </p>

            <button
                type="button"
                onClick={onAdd}
                className="group mt-10 inline-flex items-center gap-3 rounded-2xl bg-black px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
                <Plus size={18} />

                Add Address

                <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                />
            </button>
        </motion.div>
    );
}