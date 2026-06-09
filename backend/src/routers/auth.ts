import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { Subscription } from '@prisma/client';
import type { UserPlan, FeatureFlags } from '@fin-health/shared/types';
import prisma from '../lib/prisma';
import { env } from '../lib/env';
import { generateToken } from '../lib/jwt';
import { hashPassword, comparePassword } from '../lib/password';
import { createRefreshToken, revokeUserRefreshTokens } from '../lib/refreshToken';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { signupSchema, loginSchema, changePasswordSchema } from '../validators/auth';
import { generateRecurringTransactions } from '../services/recurringGenerator';
import { logger } from '../lib/logger';

const FREE_PLAN: UserPlan = {
  plan: 'free',
  status: 'active',
  trialEndsAt: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

function featureFlags(): FeatureFlags {
  return { billing: env.BILLING_ENABLED, receiptScanning: env.FEATURE_RECEIPT_SCANNING };
}

// Precomputed bcrypt hash (cost 12) of an arbitrary password, used to run a
// dummy comparePassword when the user isn't found. This keeps the timing of
// the "user not found" and "wrong password" paths similar, so login can't be
// used to enumerate registered emails via response-time differences.
const DUMMY_PASSWORD_HASH = '$2a$12$CfUTOlSQL9VVw5YZXc089eirpN4rBkPQEU0oTxrBd60DtuRYUFjje';

function derivePlan(subscription: Subscription | null | undefined): UserPlan {
  if (!subscription) return FREE_PLAN;
  return {
    plan: subscription.plan,
    status: subscription.status,
    trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

export const authRouter = router({
  signup: publicProcedure.input(signupSchema).mutation(async ({ input }) => {
    const { email, password, name } = input;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
        subscription: true,
      },
    });

    const token = generateToken(user.id);
    const refreshToken = await createRefreshToken(user.id);
    const { subscription, ...userData } = user;

    return {
      token,
      refreshToken,
      user: { ...userData, plan: derivePlan(subscription) },
      featureFlags: featureFlags(),
    };
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });
    if (!user) {
      // Run a dummy comparison so the response time matches the
      // "wrong password" path and doesn't leak whether the email exists.
      await comparePassword(password, DUMMY_PASSWORD_HASH);
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const refreshToken = await createRefreshToken(user.id);
    const { password: _, subscription, ...userWithoutPassword } = user;

    generateRecurringTransactions(user.id).catch((err) => {
      logger.error({ err, userId: user.id }, 'Failed to generate recurring transactions');
    });

    return {
      token,
      refreshToken,
      user: { ...userWithoutPassword, plan: derivePlan(subscription) },
      featureFlags: featureFlags(),
    };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
        subscription: true,
      },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

    const { subscription, ...userData } = user;
    return { user: { ...userData, plan: derivePlan(subscription) }, featureFlags: featureFlags() };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await revokeUserRefreshTokens(ctx.userId);
    return { message: 'Logged out successfully' };
  }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const valid = await comparePassword(currentPassword, user.password);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: ctx.userId },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      });
      await revokeUserRefreshTokens(user.id);

      const newToken = generateToken(user.id);
      const newRefreshToken = await createRefreshToken(user.id);

      return {
        message: 'Password updated successfully',
        token: newToken,
        refreshToken: newRefreshToken,
      };
    }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
            icon: true,
            color: true,
            subcategories: { select: { id: true, name: true } },
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            date: true,
            notes: true,
            categoryId: true,
            subcategoryId: true,
            deletedAt: true,
            createdAt: true,
          },
        },
        budgets: {
          select: {
            id: true,
            amount: true,
            month: true,
            year: true,
            isRecurring: true,
            categoryId: true,
          },
        },
        recurringTransactions: {
          select: {
            id: true,
            amount: true,
            currency: true,
            type: true,
            description: true,
            frequency: true,
            startDate: true,
            endDate: true,
            isActive: true,
            notes: true,
            categoryId: true,
            subcategoryId: true,
          },
        },
      },
    });

    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return { exportedAt: new Date().toISOString(), data: user };
  }),

  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string().min(1, 'Password is required') }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const valid = await comparePassword(input.password, user.password);
      if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Incorrect password' });

      await prisma.user.delete({ where: { id: ctx.userId } });
      return { message: 'Account and all associated data permanently deleted' };
    }),
});
