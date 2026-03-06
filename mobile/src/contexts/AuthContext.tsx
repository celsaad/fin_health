import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  removeRefreshToken,
  setOnAuthFailure,
} from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  currency?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wire up the auth failure callback so the API layer can force logout
  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
    });
    return () => setOnAuthFailure(null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setToken(data.token);
    if (data.refreshToken) await setRefreshToken(data.refreshToken);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    await setToken(data.token);
    if (data.refreshToken) await setRefreshToken(data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    await removeToken();
    await removeRefreshToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
