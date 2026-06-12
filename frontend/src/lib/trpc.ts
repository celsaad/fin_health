import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@fin-health/backend/trpc';
import { env } from '@/lib/env';
import { refreshTokens } from '@/lib/tokenRefresh';

export const trpc = createTRPCReact<AppRouter>();

// Registered by AuthProvider so the refresh handler can force logout through React Router.
let onAuthFailure: (() => void) | null = null;

export function setTRPCAuthFailure(handler: (() => void) | null) {
  onAuthFailure = handler;
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

  // Attempt to refresh tokens
  const newToken = await refreshTokens();

  if (!newToken) {
    onAuthFailure?.();
    return response;
  }

  // Retry the request with the new token
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
