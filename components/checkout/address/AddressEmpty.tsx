"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Plus } from "lucide-react";

interface AddressEmptyProps {
    onAdd: () => void;
}

export default function AddressEmpty({ onAdd }: AddressEmptyProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50 to-white px-6 py-12 sm:px-8 sm:py-14"
        >
            <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg">
                    <MapPin size={28} className="sm:h-[34px] sm:w-[34px]" />
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow"
                >
                    <Plus size={14} />
                </motion.div>
            </div>

            <h3 className="mt-6 sm:mt-7 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                Add your delivery address
            </h3>

            <p className="mt-3 max-w-sm text-center text-sm leading-6 sm:leading-7 text-zinc-500">
                Save your address once for a faster checkout next time. We ensure safe and
                timely delivery to your doorstep.
            </p>

            <motion.button
                type="button"
                onClick={onAdd}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group mt-8 sm:mt-10 inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-3.5 sm:px-7 sm:py-4 text-sm font-semibold text-white transition-all duration-300 hover:shadow-xl"
            >
                <Plus size={18} />
                Add Address
                <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                />
            </motion.button>
        </motion.div>
    );
}

