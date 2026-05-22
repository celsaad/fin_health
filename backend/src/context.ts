import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Subscription } from '@prisma/client';
import { verifyToken } from './lib/jwt';
import prisma from './lib/prisma';

export interface Context {
  userId: string | null;
  subscription: Subscription | null;
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { userId: null, subscription: null };
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { passwordChangedAt: true, subscription: true },
    });

    if (!user) return { userId: null, subscription: null };

    const passwordChangedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < passwordChangedAtSec) {
      return { userId: null, subscription: null };
    }

    return { userId: payload.userId, subscription: user.subscription };
  } catch {
    return { userId: null, subscription: null };
  }
}
