import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Prisma } from '@prisma/client';
import type { Context } from './context';
import { t as translate } from './lib/i18n';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Centrally converts Prisma constraint errors to typed TRPCErrors.
const prismaErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (err: unknown) {
    if (err instanceof TRPCError) throw err;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2002':
          throw new TRPCError({
            code: 'CONFLICT',
            message: translate('duplicateRecord', { fields: '' }),
            cause: err,
          });
        case 'P2025':
          throw new TRPCError({ code: 'NOT_FOUND', message: translate('notFound'), cause: err });
        case 'P2003':
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: translate('relatedNotFound'),
            cause: err,
          });
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: translate('databaseError'),
            cause: err,
          });
      }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: translate('invalidData'), cause: err });
    }

    throw err;
  }
});

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const proMiddleware = t.middleware(({ ctx, next }) => {
  const sub = ctx.subscription;
  if (!sub || sub.plan !== 'pro' || (sub.status !== 'active' && sub.status !== 'trialing')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'PRO_REQUIRED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId as string } });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure.use(prismaErrorMiddleware);
export const protectedProcedure = publicProcedure.use(authMiddleware);
export const proProcedure = protectedProcedure.use(proMiddleware);
