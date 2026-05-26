import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { trpcClient, setCachedToken, setTRPCAuthFailure } from '../lib/trpc';
import {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  removeRefreshToken,
} from '../services/api';
import type { UserPlan, FeatureFlags } from '@fin-health/shared/types';

interface User {
  id: string;
  name: string;
  email: string;
  currency?: string;
  plan: UserPlan;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = { billing: true };

interface AuthContextValue {
  user: User | null;
  featureFlags: FeatureFlags;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  // Wire up the auth failure callback so the tRPC layer can force logout
  useEffect(() => {
    setTRPCAuthFailure(() => {
      setUser(null);
    });
    return () => setTRPCAuthFailure(null);
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
      // Warm the in-memory cache so the first request goes out with the token
      setCachedToken(token);
      const data = await trpcClient.auth.me.query();
      setUser(data.user as User);
      if (data.featureFlags) setFeatureFlags(data.featureFlags as FeatureFlags);
    } catch {
      await removeToken();
      await removeRefreshToken();
      setCachedToken(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const data = await trpcClient.auth.login.mutate({ email, password });
    await setToken(data.token);
    if (data.refreshToken) await setRefreshToken(data.refreshToken);
    setCachedToken(data.token);
    setUser(data.user as User);
    if (data.featureFlags) setFeatureFlags(data.featureFlags as FeatureFlags);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await trpcClient.auth.signup.mutate({ name, email, password });
    await setToken(data.token);
    if (data.refreshToken) await setRefreshToken(data.refreshToken);
    setCachedToken(data.token);
    setUser(data.user as User);
    if (data.featureFlags) setFeatureFlags(data.featureFlags as FeatureFlags);
  }, []);

  const logout = useCallback(async () => {
    try {
      await trpcClient.auth.logout.mutate(undefined);
    } catch {
      // ignore — still clear local state
    }
    await removeToken();
    await removeRefreshToken();
    setCachedToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, featureFlags, isLoading, isAuthenticated: !!user, login, signup, logout }}
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
