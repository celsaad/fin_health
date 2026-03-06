import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { hashPassword, comparePassword } from '../lib/password';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, changePasswordSchema } from '../validators/auth';
import { AppError } from '../middleware/errorHandler';
import { generateRecurringTransactions } from '../services/recurringGenerator';

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
        select: { id: true, email: true, name: true, currency: true, createdAt: true },
      });

      const token = generateToken(user.id);

      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = generateToken(user.id);

      // Generate any pending recurring transactions on login
      try {
        await generateRecurringTransactions(user.id);
      } catch (err) {
        console.error('Failed to generate recurring transactions:', err);
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true, name: true, currency: true, createdAt: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

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
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
