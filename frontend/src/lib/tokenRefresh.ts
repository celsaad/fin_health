import { env } from '@/lib/env';

let currentRefreshPromise: Promise<string | null> | null = null;

export function refreshTokens(): Promise<string | null> {
  // If a refresh is already in flight, return the same promise
  if (currentRefreshPromise) {
    return currentRefreshPromise;
  }

  // Start a new refresh
  currentRefreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${env.VITE_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // HTTP error: clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.token as string;
    } catch {
      // Error: clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } finally {
      currentRefreshPromise = null;
    }
  })();

  return currentRefreshPromise;
}
