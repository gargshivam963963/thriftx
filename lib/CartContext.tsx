'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';

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

const STORAGE_KEY = 'thriftx_cart';

function parsePrice(price: string): number {
    return Number(price.replace(/[^\d.]/g, '')) || 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as CartItem[];
                setCartItems(parsed);
            }
        } catch {
            setCartItems([]);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity = 1) => {
        setCartItems((current) => {
            const existingItem = current.find((item) => item.id === product.id);
            if (existingItem) {
                return current.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...current, { ...product, quantity }];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems((current) => current.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setCartItems((current) =>
            current
                .map((item) => (item.id === id ? { ...item, quantity } : item))
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0),
        [cartItems]
    );

    return (
        <CartContext.Provider
            value={{ cartItems, totalItems, subtotal, addToCart, removeFromCart, updateQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
