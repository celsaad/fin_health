import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserPlan, FeatureFlags } from '@fin-health/shared/types';
import { trpc, setTRPCAuthFailure } from '@/lib/trpc';

interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = { billing: true };

interface AuthContextType {
  user: User | null;
  token: string | null;
  featureFlags: FeatureFlags;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'));

  const loginMut = trpc.auth.login.useMutation();
  const signupMut = trpc.auth.signup.useMutation();
  const logoutMut = trpc.auth.logout.useMutation();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  });

  // Resolve loading state from the me query
  useEffect(() => {
    if (!hasToken) {
      setIsLoading(false);
      return;
    }
    if (meQuery.isSuccess) {
      setUser(meQuery.data.user as User);
      if (meQuery.data.featureFlags) setFeatureFlags(meQuery.data.featureFlags as FeatureFlags);
      setIsLoading(false);
    } else if (meQuery.isError) {
      // Only log out on UNAUTHORIZED/FORBIDDEN errors; network errors don't touch localStorage
      const errorCode = meQuery.error?.data?.code;
      if (errorCode === 'UNAUTHORIZED' || errorCode === 'FORBIDDEN') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setHasToken(false);
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [hasToken, meQuery.isSuccess, meQuery.isError, meQuery.data, meQuery.error]);

  // Register the refresh-failure handler so 401s go through React Router
  useEffect(() => {
    setTRPCAuthFailure(() => {
      setHasToken(false);
      setUser(null);
      navigate('/login', { replace: true });
    });
    return () => setTRPCAuthFailure(null);
  }, [navigate]);

  // Listen for cross-tab logout via storage event
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && event.newValue === null) {
        setHasToken(false);
        setUser(null);
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginMut.mutateAsync({ email, password });
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setHasToken(true);
      setUser(data.user as User);
      if (data.featureFlags) setFeatureFlags(data.featureFlags as FeatureFlags);
    },
    [loginMut],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const data = await signupMut.mutateAsync({ email, password, name });
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setHasToken(true);
      setUser(data.user as User);
      if (data.featureFlags) setFeatureFlags(data.featureFlags as FeatureFlags);
    },
    [signupMut],
  );

  const logout = useCallback(() => {
    logoutMut.mutate(undefined);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setHasToken(false);
    setUser(null);
    navigate('/login', { replace: true });
  }, [logoutMut, navigate]);

  const refreshUser = useCallback(async () => {
    await meQuery.refetch();
  }, [meQuery]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: hasToken ? localStorage.getItem('token') : null,
        featureFlags,
        login,
        signup,
        logout,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
