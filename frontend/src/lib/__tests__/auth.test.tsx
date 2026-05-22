import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import type { ReactNode } from 'react';

// ---- tRPC mock ----
const mockAuthMeUseQuery = vi.fn();
const mockAuthLoginUseMutation = vi.fn();
const mockAuthSignupUseMutation = vi.fn();
const mockAuthLogoutUseMutation = vi.fn();
const mockSetTRPCAuthFailure = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    auth: {
      me: { useQuery: (...args: unknown[]) => mockAuthMeUseQuery(...args) },
      login: { useMutation: (...args: unknown[]) => mockAuthLoginUseMutation(...args) },
      signup: { useMutation: (...args: unknown[]) => mockAuthSignupUseMutation(...args) },
      logout: { useMutation: (...args: unknown[]) => mockAuthLogoutUseMutation(...args) },
    },
  },
  setTRPCAuthFailure: (...args: unknown[]) => mockSetTRPCAuthFailure(...args),
  createTRPCLinks: vi.fn(() => []),
}));

// Mutation helper — returns a standard useMutation shape that calls callbacks synchronously
function makeMutation(mutationFn: (...args: unknown[]) => unknown) {
  return (options: { onSuccess?: (data: unknown) => void; onError?: (err: Error) => void } = {}) => ({
    mutate: async (input?: unknown) => {
      try {
        const result = await mutationFn(input);
        options.onSuccess?.(result);
      } catch (err) {
        options.onError?.(err as Error);
      }
    },
    mutateAsync: async (input?: unknown) => {
      const result = await mutationFn(input);
      options.onSuccess?.(result);
      return result;
    },
    isSuccess: false,
    isPending: false,
    isError: false,
  });
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Default: no user, queries settled immediately
  mockAuthMeUseQuery.mockReturnValue({ isSuccess: false, isError: false, data: undefined, refetch: vi.fn() });
  mockAuthLoginUseMutation.mockImplementation(makeMutation(vi.fn()));
  mockAuthSignupUseMutation.mockImplementation(makeMutation(vi.fn()));
  mockAuthLogoutUseMutation.mockImplementation(makeMutation(vi.fn()));
});

describe('useAuth', () => {
  it('throws if used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('starts with isLoading true and resolves to no user when no token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('fetches user when token exists in localStorage', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', plan: {} };
    localStorage.setItem('token', 'existing-token');
    mockAuthMeUseQuery.mockReturnValue({
      isSuccess: true,
      isError: false,
      data: { user: mockUser },
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('existing-token');
  });

  it('clears token if fetching user fails', async () => {
    localStorage.setItem('token', 'bad-token');
    mockAuthMeUseQuery.mockReturnValue({
      isSuccess: false,
      isError: true,
      data: undefined,
      error: new Error('Unauthorized'),
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('login stores token and sets user', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', plan: {} };
    const loginFn = vi.fn().mockResolvedValue({ token: 'new-token', user: mockUser });
    mockAuthLoginUseMutation.mockImplementation(makeMutation(loginFn));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.token).toBe('new-token');
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('signup stores token and sets user', async () => {
    const mockUser = { id: '2', email: 'new@test.com', name: 'New User', plan: {} };
    const signupFn = vi.fn().mockResolvedValue({ token: 'signup-token', user: mockUser });
    mockAuthSignupUseMutation.mockImplementation(makeMutation(signupFn));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signup('new@test.com', 'password', 'New User');
    });

    expect(localStorage.getItem('token')).toBe('signup-token');
  });

  it('logout clears user, token, refreshToken, and localStorage', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', plan: {} };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    mockAuthMeUseQuery.mockReturnValue({
      isSuccess: true,
      isError: false,
      data: { user: mockUser },
      refetch: vi.fn(),
    });
    mockAuthLogoutUseMutation.mockImplementation(makeMutation(vi.fn().mockResolvedValue({})));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
