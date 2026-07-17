'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { account, isAppwriteEndpointConfigured } from './appwrite';

type AppwriteUser = {
  $id: string;
  name?: string;
  email?: string;
};

interface AuthContextType {
  user: AppwriteUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!isAppwriteEndpointConfigured) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await account.get();
      setUser({
        $id: currentUser.$id,
        name: currentUser.name,
        email: currentUser.email,
      });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!isAppwriteEndpointConfigured) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await account.get();
        setUser({
          $id: currentUser.$id,
          name: currentUser.name,
          email: currentUser.email,
        });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    if (isAppwriteEndpointConfigured) {
      await account.deleteSession('current');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
