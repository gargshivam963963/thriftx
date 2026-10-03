
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { Product } from "@/lib/services/products";
import type { CartProduct } from "@/lib/services/cartProducts";
import {
    addToCart as persistAddToCart,
    removeCartItem as persistRemoveCartItem,
    clearCart as persistClearCart,
} from "@/lib/services/cart";
import { useAuth } from "@/lib/AuthContext";

export type CartItem = CartProduct;

interface CartContextType {
    cartItems: CartItem[];
    totalItems: number;
    subtotal: number;
    loading: boolean;
    error: string | null;
    refreshCart: () => Promise<void>;
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    totalItems: 0,
    subtotal: 0,
    loading: true,
    error: null,
    refreshCart: async () => { },
    addToCart: async () => { },
    removeFromCart: async () => { },
    updateQuantity: async () => { },
    clearCart: async () => { },
});

async function fetchServerCart(): Promise<CartItem[]> {
    const response = await fetch("/api/shop/cart-products", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        products?: CartItem[];
    };

    if (!response.ok || !result.success || !Array.isArray(result.products)) {
        throw new Error(
            result.message || "Unable to load your cart. Please retry.",
        );
    }

    return result.products;
}

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const requestVersion = useRef(0);

    const refreshCart = useCallback(async () => {
        const version = ++requestVersion.current;

        if (authLoading) return;

        if (!user) {
            setCartItems([]);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const serverItems = await fetchServerCart();

            if (version !== requestVersion.current) return;

            // A product is one-of-a-kind: one cart row per product.
            const unique = new Map<string, CartItem>();

            for (const item of serverItems) {
                if (
                    item &&
                    typeof item.id === "string" &&
                    typeof item.cartId === "string" &&
                    !unique.has(item.id)
                ) {
                    unique.set(item.id, {
                        ...item,
                        quantity: 1,
                    });
                }
            }

            setCartItems(Array.from(unique.values()));
        } catch (err) {
            if (version !== requestVersion.current) return;

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load your cart.",
            );

            // Do not replace the cart with [] on a network/API failure.
        } finally {
            if (version === requestVersion.current) {
                setLoading(false);
            }
        }
    }, [authLoading, user]);

    useEffect(() => {
        void refreshCart();

        return () => {
            requestVersion.current += 1;
        };
    }, [refreshCart]);

    const addToCart = useCallback(
        async (product: Product, quantity = 1) => {
            if (!user) {
                throw new Error("Please sign in to save items to your cart.");
            }

            if (quantity !== 1) {
                throw new Error("This one-of-a-kind item has a quantity of 1.");
            }

            await persistAddToCart(product.id, 1);
            await refreshCart();

            if (requestVersion.current > 0 && error) {
                throw new Error(error);
            }
        },
        [user, refreshCart, error],
    );

    const removeFromCart = useCallback(
        async (productId: string) => {
            const item = cartItems.find((entry) => entry.id === productId);

            if (!item) {
                throw new Error("Cart item is no longer available.");
            }

            await persistRemoveCartItem(item.cartId);
            await refreshCart();
        },
        [cartItems, refreshCart],
    );

    const updateQuantity = useCallback(
        async (productId: string, quantity: number) => {
            if (quantity > 1) {
                throw new Error("This one-of-a-kind item has a quantity of 1.");
            }

            if (quantity <= 0) {
                await removeFromCart(productId);
            }
        },
        [removeFromCart],
    );

    const clearCart = useCallback(async () => {
        await persistClearCart();
        await refreshCart();
    }, [refreshCart]);

    const totalItems = cartItems.length;

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price, 0),
        [cartItems],
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalItems,
                subtotal,
                loading,
                error,
                refreshCart,
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