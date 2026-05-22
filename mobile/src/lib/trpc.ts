import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import * as SecureStore from 'expo-secure-store';
import type { AppRouter } from '@fin-health/backend/trpc';
import { env } from '../lib/env';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// In-memory token cache — avoids async SecureStore reads on every request.
let cachedToken: string | null = null;

export function setCachedToken(token: string | null) {
  cachedToken = token;
}

export function getCachedToken(): string | null {
  return cachedToken;
}

// Called by AuthContext on auth failure (refresh exhausted)
let onAuthFailure: (() => void) | null = null;

export function setTRPCAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${env.EXPO_PUBLIC_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
    cachedToken = data.token as string;
    return cachedToken;
  } catch {
    return null;
  }
}

async function authenticatedFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!init) init = {};
  const headers = new Headers(init.headers);
  if (cachedToken) headers.set('Authorization', `Bearer ${cachedToken}`);

  const response = await fetch(url, { ...init, headers });
  if (response.status !== 401) return response;

  const urlStr = url.toString();
  if (
    urlStr.includes('auth.login') ||
    urlStr.includes('auth.signup') ||
    urlStr.includes('/auth/refresh')
  ) {
    return response;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    doRefresh().then((newToken) => {
      const waiters = refreshQueue;
      refreshQueue = [];
      isRefreshing = false;
      waiters.forEach((cb) => cb(newToken));
      if (!newToken) {
        cachedToken = null;
        onAuthFailure?.();
      }
    });
  }

  const newToken = await new Promise<string | null>((resolve) => {
    refreshQueue.push(resolve);
  });

  if (!newToken) return response;

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set('Authorization', `Bearer ${newToken}`);
  return fetch(url, { ...init, headers: retryHeaders });
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.EXPO_PUBLIC_API_URL}/api/trpc`,
      transformer: superjson,
      fetch: authenticatedFetch,
    }),
  ],
});
