
"use client";

import type { Product } from "@/lib/services/products";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export type CartItem = Product & { quantity: number };

interface CartContextType {
    cartItems: CartItem[];
    totalItems: number;
    subtotal: number;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    totalItems: 0,
    subtotal: 0,
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
});

const STORAGE_KEY = "thriftx_cart";

function normalizeCart(items: CartItem[]): CartItem[] {
    const uniqueItems = new Map<string, CartItem>();

    for (const item of items) {
        if (!item || typeof item.id !== "string" || !item.id) {
            continue;
        }

        if (!uniqueItems.has(item.id)) {
            uniqueItems.set(item.id, {
                ...item,
                quantity: 1,
            });
        }
    }

    return Array.from(uniqueItems.values());
}

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return [];
            }

            const parsed: unknown = JSON.parse(stored);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return normalizeCart(parsed as CartItem[]);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cartItems),
            );
        } catch {
            // Cart remains usable for the current session if storage is unavailable.
        }
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems((current) => {
            const alreadyAdded = current.some(
                (item) => item.id === product.id,
            );

            if (alreadyAdded) {
                return current;
            }

            return [
                ...current,
                {
                    ...product,
                    quantity: 1,
                },
            ];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems((current) =>
            current.filter((item) => item.id !== id),
        );
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
        }

        // Unique thrift products always remain quantity 1.
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.length;

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) => sum + item.price,
                0,
            ),
        [cartItems],
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalItems,
                subtotal,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);