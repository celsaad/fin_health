/**
 * tRPC client for mobile app
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@fin-health/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get auth token from AsyncStorage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Create tRPC client
 */
export function createTRPCClient() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${apiUrl}/trpc`,
        async headers() {
          const token = await getAuthToken();
          return token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {};
        },
      }),
    ],
  });
}
