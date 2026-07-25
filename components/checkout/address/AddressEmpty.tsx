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
            className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-gradient-to-b from-zinc-50/80 to-white px-6 py-14 sm:px-8 sm:py-16"
        >
            {/* Icon with spring animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1,
                }}
                className="relative"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg sm:h-20 sm:w-20">
                    <MapPin size={28} className="sm:h-[34px] sm:w-[34px]" />
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.25,
                        type: "spring",
                        stiffness: 300,
                        damping: 12,
                    }}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
                >
                    <Plus size={14} />
                </motion.div>
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="mt-6 font-serif text-xl font-semibold tracking-tight text-zinc-900 sm:mt-7 sm:text-2xl"
            >
                Add your delivery address
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-3 max-w-sm text-center text-sm leading-6 text-zinc-500 sm:leading-7"
            >
                Save your address once for a faster checkout next time. We ensure safe
                and timely delivery to your doorstep.
            </motion.p>

            <motion.button
                type="button"
                onClick={onAdd}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/30 sm:mt-10 sm:px-8 sm:py-4"
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

