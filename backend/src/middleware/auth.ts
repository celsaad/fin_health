import { Request, Response, NextFunction } from 'express';
import type { Subscription } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import prisma from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      subscription?: Subscription | null;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);

    // Reject tokens issued before the last password change
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, passwordChangedAt: true, subscription: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }

    const passwordChangedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < passwordChangedAtSec) {
      res.status(401).json({ error: 'Token invalidated by password change. Please log in again.' });
      return;
    }

    req.userId = payload.userId;
    req.subscription = user.subscription;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
