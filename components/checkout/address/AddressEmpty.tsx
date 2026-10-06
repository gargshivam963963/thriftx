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
            className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-gradient-to-b from-subtle/80 to-card px-5 py-12 text-center sm:px-8 sm:py-16"
        >
            <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1,
                }}
                className="relative"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-white shadow-lg sm:h-20 sm:w-20">
                    <MapPin size={28} className="sm:h-[34px] sm:w-[34px]" />
                </div>

                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white shadow-md">
                    <Plus size={14} />
                </span>
            </motion.div>

            <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground sm:mt-7 sm:text-2xl">
                Add your delivery address
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:leading-7">
                Save your address once for a faster checkout next time. We’ll show
                delivery benefits based on your selected location.
            </p>

            <motion.button
                type="button"
                onClick={onAdd}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-2xl bg-foreground px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-foreground/20 transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-10 sm:px-8"
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