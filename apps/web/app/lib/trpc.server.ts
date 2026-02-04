/**
 * Server-side tRPC client for Remix loaders and actions
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@fin-health/api';

const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Create a tRPC client with optional auth token
 */
export function createTRPCClient(token?: string) {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }),
    ],
  });
}
