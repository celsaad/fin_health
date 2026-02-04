/**
 * Authentication router
 */

import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas } from '@fin-health/domain';

export const authRouter = router({
  /**
   * Sign up a new user
   */
  signUp: publicProcedure.input(schemas.signUpSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    try {
      // Create user in Supabase Auth
      const { data, error } = await ctx.supabase.auth.signUp({
        email,
        password,
      });

      console.log('data', data);

      if (error || !data.user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error?.message || 'Failed to create user',
        });
      }

      // Insert user into our database
      await ctx.db.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          currency: 'USD',
          timezone: 'America/New_York',
          monthStartDay: 1,
        },
      });

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign up',
      });
    }
  }),

  /**
   * Sign in an existing user
   */
  signIn: publicProcedure.input(schemas.signInSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    try {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error?.message || 'Invalid credentials',
        });
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sign in',
      });
    }
  }),

  /**
   * Get current user info
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.userId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),
});
