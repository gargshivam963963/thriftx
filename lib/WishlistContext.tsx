"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getWishlistedProductIds,
  toggleWishlist as persistWishlistToggle,
} from "@/lib/services/wishlist";

interface WishlistContextValue {
  productIds: ReadonlySet<string>;
  loading: boolean;
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const authSnapshotRef = useRef<string | null | undefined>(undefined);
  const loadedUserIdRef = useRef<string | null | undefined>(undefined);
  const requestRef = useRef<{
    userId: string;
    promise: Promise<void>;
  } | null>(null);

  useLayoutEffect(() => {
    const currentUserId = authLoading ? null : (user?.id ?? null);
    userIdRef.current = currentUserId;
    if (authSnapshotRef.current === currentUserId) return;

    authSnapshotRef.current = currentUserId;
    loadedUserIdRef.current = undefined;
    requestRef.current = null;
    setProductIds(new Set());
    setLoading(false);
  }, [authLoading, user?.id]);

  const load = useCallback(async () => {
    if (authLoading) return;
    const currentUserId = user?.id ?? null;

    if (!currentUserId) {
      loadedUserIdRef.current = null;
      setProductIds(new Set());
      return;
    }

    if (loadedUserIdRef.current === currentUserId) return;
    if (requestRef.current?.userId === currentUserId) {
      return requestRef.current.promise;
    }

    setLoading(true);
    const promise = getWishlistedProductIds()
      .then((ids) => {
        if (userIdRef.current === currentUserId) {
          setProductIds(new Set(ids));
          loadedUserIdRef.current = currentUserId;
        }
      })
      .finally(() => {
        if (requestRef.current?.promise === promise) {
          requestRef.current = null;
        }
        if (userIdRef.current === currentUserId) {
          setLoading(false);
        }
      });

    requestRef.current = { userId: currentUserId, promise };
    return promise;
  }, [authLoading, user?.id]);

  const toggle = useCallback(
    async (productId: string) => {
      if (authLoading || !user) {
        throw new Error("Please sign in to update your wishlist");
      }

      await load();
      const wishlisted = await persistWishlistToggle(productId);
      if (userIdRef.current === user.id) {
        setProductIds((current) => {
          const next = new Set(current);
          if (wishlisted) next.add(productId);
          else next.delete(productId);
          return next;
        });
        loadedUserIdRef.current = user.id;
      }
      return wishlisted;
    },
    [authLoading, load, user],
  );

  const value = useMemo(
    () => ({ productIds, loading, load, toggle }),
    [productIds, loading, load, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}

export function useWishlistProduct(productId: string) {
  const { productIds, loading, load, toggle } = useWishlist();

  useEffect(() => {
    load().catch((error) => {
      console.error("Failed to load wishlist status:", error);
    });
  }, [load]);

  return {
    wishlisted: productIds.has(productId),
    loading,
    toggle: () => toggle(productId),
  };
}
