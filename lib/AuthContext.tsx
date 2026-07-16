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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAppwriteEndpointConfigured) {
      setLoading(false);
      return;
    }

    account
      .get()
      .then((currentUser) => {
        setUser({
          $id: currentUser.$id,
          name: currentUser.name,
          email: currentUser.email,
        });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    if (isAppwriteEndpointConfigured) {
      await account.deleteSession('current');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
