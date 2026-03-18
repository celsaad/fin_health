import { Router, Request, Response, NextFunction } from 'express';
import type { Subscription } from '@prisma/client';
import type { UserPlan } from '@fin-health/shared/types';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { hashPassword, comparePassword } from '../lib/password';
import {
  createRefreshToken,
  consumeRefreshToken,
  revokeUserRefreshTokens,
} from '../lib/refreshToken';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, changePasswordSchema } from '../validators/auth';
import { AppError } from '../middleware/errorHandler';
import { generateRecurringTransactions } from '../services/recurringGenerator';
import { logger } from '../lib/logger';

const FREE_PLAN: UserPlan = {
  plan: 'free',
  status: 'active',
  trialEndsAt: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

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

const router = Router();

// POST /api/auth/signup
router.post(
  '/signup',
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('Email already registered', 409);
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

      res
        .status(201)
        .json({ token, refreshToken, user: { ...userData, plan: derivePlan(subscription) } });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true },
      });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = generateToken(user.id);
      const refreshToken = await createRefreshToken(user.id);

      const { password: _, subscription, ...userWithoutPassword } = user;
      res.json({
        token,
        refreshToken,
        user: { ...userWithoutPassword, plan: derivePlan(subscription) },
      });

      // Generate any pending recurring transactions in background (non-blocking)
      generateRecurringTransactions(user.id).catch((err) => {
        logger.error({ err, userId: user.id }, 'Failed to generate recurring transactions');
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { subscription, ...userData } = user;
    res.json({ user: { ...userData, plan: derivePlan(subscription) } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError('Refresh token is required', 400);
    }

    const record = await consumeRefreshToken(refreshToken);
    if (!record) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const token = generateToken(record.userId);
    const newRefreshToken = await createRefreshToken(record.userId);

    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await revokeUserRefreshTokens(req.userId!);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/password
router.put(
  '/password',
  authMiddleware,
  validate(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const valid = await comparePassword(currentPassword, user.password);
      if (!valid) {
        throw new AppError('Current password is incorrect', 401);
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      });

      // Revoke all existing refresh tokens (invalidates other sessions)
      await revokeUserRefreshTokens(user.id);

      // Issue fresh tokens so the current session stays valid
      const newToken = generateToken(user.id);
      const newRefreshToken = await createRefreshToken(user.id);

      res.json({
        message: 'Password updated successfully',
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/export — GDPR data export
router.get('/export', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.setHeader('Content-Disposition', 'attachment; filename="user-data-export.json"');
    res.json({ exportedAt: new Date().toISOString(), data: user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/account — GDPR account deletion
router.delete(
  '/account',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        throw new AppError('Password confirmation is required', 400);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        throw new AppError('Incorrect password', 401);
      }

      // Cascade delete removes all related data (transactions, budgets, categories, etc.)
      await prisma.user.delete({ where: { id: userId } });

      res.json({ message: 'Account and all associated data permanently deleted' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
