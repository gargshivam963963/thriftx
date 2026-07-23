'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Heart,
    Minus,
    Plus,
    ShieldCheck,
    Trash2,
} from 'lucide-react';

import type { CartProduct } from '@/lib/services/cartProducts';
import ConfirmPopover from '@/components/ui/ConfirmPopover';

interface CartItemProps {
    item: CartProduct;
    onIncrease: (cartId: string) => void;
    onDecrease: (
        cartId: string,
        quantity: number
    ) => void;
    onRemove: (cartId: string) => void;
}

export default function CartItem({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemProps) {

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const retailPrice =
        item.retailPrice &&
            item.retailPrice > item.price
            ? item.retailPrice
            : undefined;

    return (
        <>
            <motion.article
                layout
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    y: -20,
                    scale: .98,
                }}
                transition={{
                    duration: .25,
                }}
                className="
                    group
                    overflow-hidden
                    rounded-[26px]
                    border
                    border-neutral-200
                    bg-white
                    transition-all
                    duration-300
                    hover:border-neutral-300
                    hover:shadow-xl
                "
            >
                <div
                    className="
                        grid
                        grid-cols-[250px_1fr]
                        gap-5
                        p-5
                    "
                >

                    {/* IMAGE */}
                    <div
                        className="
                            relative
                            h-[200px]
                            w-[240px]
                            overflow-hidden
                            rounded-2xl
                            bg-neutral-100
                            transition-transform
                            duration-700    
                            group-hover:scale-[1.05]
                        "
                    >
                        <Image
                            src={item.primaryImage}
                            alt={item.title}
                            fill
                            sizes="150px"
                            className="
                                object-cover
                                transition-transform
                                duration-700
                                group-hover:scale-[1.05]
                            "
                        />

                        <div
                            className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black/5
                                via-transparent
                                to-transparent
                            "
                        />

                    </div>

                    {/* CONTENT */}

                    <div
                        className="
                            flex
                            min-w-0
                            flex-col
                            justify-between
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-5
                            "
                        >

                            <div className="min-w-0 flex-1">

                                <h2
                                    className="
                                        line-clamp-2
                                        font-serif
                                        text-[28px]
                                        font-semibold
                                        leading-[1.05]
                                        tracking-tight
                                        text-black
                                    "
                                >
                                    {item.title}
                                </h2>

                            </div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    shrink-0
                                "
                            >

                                <div
                                    className="
                                        mr-2
                                        text-right
                                    "
                                >

                                    <p
                                        className="
                                            text-[30px]
                                            font-bold
                                            leading-none
                                            tracking-tight
                                        "
                                    >
                                        ₹{item.price.toLocaleString()}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-neutral-200
                                        transition-all
                                        duration-300
                                        hover:border-black
                                        hover:bg-black
                                        hover:text-white
                                    "
                                >
                                    <Heart size={17} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteOpen(true)
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-neutral-200
                                        transition-all
                                        duration-300
                                        hover:border-red-300
                                        hover:bg-red-50
                                        hover:text-red-600
                                    "
                                >
                                    <Trash2 size={17} />
                                </button>

                            </div>

                        </div>

                        {/* META */}

                        <div className="mt-3">

                            <p
                                className="
                                    text-[15px]
                                    text-neutral-500
                                "
                            >
                                Size {item.size}

                                <span className="mx-2">
                                    •
                                </span>

                                {item.condition}
                            </p>

                            {retailPrice && (
                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        text-neutral-400
                                    "
                                >
                                    Retail

                                    <span className="ml-2 line-through">
                                        ₹{retailPrice.toLocaleString()}
                                    </span>
                                </p>
                            )}

                        </div>
                        {/* FOOTER */}

                        <div
                            className="
                                mt-6
                                flex
                                items-end
                                justify-between
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-emerald-50
                                        text-emerald-700
                                    "
                                >
                                    <ShieldCheck size={17} />
                                </div>

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-neutral-900
                                        "
                                    >
                                        Authenticated
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            text-neutral-500
                                        "
                                    >
                                        Verified by THRIFTX
                                    </p>

                                </div>

                            </div>

                            {/* QUANTITY */}

                            <div
                                className="
                                    flex
                                    items-center
                                    rounded-full
                                    border
                                    border-neutral-200
                                    bg-neutral-50
                                    p-1
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        onDecrease(
                                            item.cartId,
                                            item.quantity
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        transition-all
                                        duration-300
                                        hover:bg-white
                                        active:scale-90
                                    "
                                >
                                    <Minus size={16} />
                                </button>

                                <span
                                    className="
                                        min-w-[42px]
                                        text-center
                                        text-base
                                        font-semibold
                                    "
                                >
                                    {item.quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onIncrease(
                                            item.cartId
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        transition-all
                                        duration-300
                                        hover:bg-white
                                        active:scale-90
                                    "
                                >
                                    <Plus size={16} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </motion.article>

            <ConfirmPopover
                open={deleteOpen}
                title="Remove this piece?"
                description="Once removed, this item will disappear from your shopping bag. You can always add it again later if it's still available."
                confirmText="Remove"
                cancelText="Keep"
                onCancel={() =>
                    setDeleteOpen(false)
                }
                onConfirm={() => {
                    setDeleteOpen(false);
                    onRemove(item.cartId);
                }}
            />

        </>

    );

}