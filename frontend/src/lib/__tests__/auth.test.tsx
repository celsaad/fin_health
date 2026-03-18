import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import api from '@/lib/api';
import type { ReactNode } from 'react';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  const instance = {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({}),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    ...actual,
    default: instance,
    setAuthErrorHandler: vi.fn(),
  };
});

const mockApi = vi.mocked(api);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
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
    localStorage.setItem('token', 'existing-token');
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    mockApi.get.mockResolvedValueOnce({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('existing-token');
    expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
  });

  it('clears token if fetching user fails', async () => {
    localStorage.setItem('token', 'bad-token');
    mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('login stores token and sets user', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    const mockResponse = {
      data: { token: 'new-token', user: mockUser },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);
    // After login sets the token, the useEffect fires fetchUser
    mockApi.get.mockResolvedValueOnce({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.token).toBe('new-token');
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('signup stores token and sets user', async () => {
    const mockUser = { id: '2', email: 'new@test.com', name: 'New User' };
    const mockResponse = {
      data: { token: 'signup-token', user: mockUser },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);
    // After signup sets the token, the useEffect fires fetchUser
    mockApi.get.mockResolvedValueOnce({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signup('new@test.com', 'password', 'New User');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(localStorage.getItem('token')).toBe('signup-token');
  });

  it('logout clears user, token, refreshToken, and localStorage', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    mockApi.get.mockResolvedValueOnce({ data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
