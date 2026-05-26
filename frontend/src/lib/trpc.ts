import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@fin-health/backend/trpc';
import { env } from '@/lib/env';

export const trpc = createTRPCReact<AppRouter>();

// Registered by AuthProvider so the refresh handler can force logout through React Router.
let onAuthFailure: (() => void) | null = null;

export function setTRPCAuthFailure(handler: (() => void) | null) {
  onAuthFailure = handler;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${env.VITE_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.token as string;
  } catch {
    return null;
  }
}

async function authenticatedFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...init, headers });
  if (response.status !== 401) return response;

  // Skip refresh loop for auth procedures
  const urlStr = url.toString();
  if (
    urlStr.includes('auth.login') ||
    urlStr.includes('auth.signup') ||
    urlStr.includes('/auth/refresh')
  ) {
    return response;
  }

  // Queue callers behind a single in-flight refresh
  if (!isRefreshing) {
    isRefreshing = true;
    doRefresh().then((newToken) => {
      const waiters = refreshQueue;
      refreshQueue = [];
      isRefreshing = false;
      waiters.forEach((cb) => cb(newToken));
      if (!newToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        onAuthFailure?.();
      }
    });
  }

  const newToken = await new Promise<string | null>((resolve) => {
    refreshQueue.push(resolve);
  });

  if (!newToken) return response;

  const retryHeaders = new Headers(init?.headers);
  retryHeaders.set('Authorization', `Bearer ${newToken}`);
  return fetch(url, { ...init, headers: retryHeaders });
}

export function createTRPCLinks() {
  return [
    httpBatchLink({
      url: `${env.VITE_API_URL}/trpc`,
      transformer: superjson,
      fetch: authenticatedFetch,
    }),
  ];
}
