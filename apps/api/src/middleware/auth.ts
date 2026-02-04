/**
 * Authentication middleware for protected procedures
 */

import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc.js';

export const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now TypeScript knows userId is non-null
    },
  });
});
