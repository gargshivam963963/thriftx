'use client';

import { createContext, useContext, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';

type BetterAuthUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  phone?: string;
  role?: string;
};

interface AuthContextType {
  user: BetterAuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();

  const user = useMemo<BetterAuthUser | null>(() => {
    const sessionUser = data?.user;
    if (!sessionUser) {
      return null;
    }

    const typedUser = sessionUser as typeof sessionUser & { role?: string };

    return {
      ...typedUser,
      id: sessionUser.id,
      name: sessionUser.name || "User",
      email: sessionUser.email || "",
      phone: "",
      role: typedUser.role || "customer",
    };
  }, [data]);

  const refreshUser = async () => {
    await refetch();
  };

  const logout = async () => {
    const response = await authClient.signOut();
    if (response.error) {
      throw response.error;
    }
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
