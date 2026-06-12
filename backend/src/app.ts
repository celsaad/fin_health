import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { stringify } from 'csv-stringify';
import { Prisma } from '@prisma/client';
import prisma from './lib/prisma';
import { logger } from './lib/logger';
import { errorHandler, AppError } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { env } from './lib/env';
import { Sentry } from './lib/sentry';
import { appRouter } from './routers';
import { createContext } from './context';
import { generateToken } from './lib/jwt';
import { consumeRefreshToken, createRefreshToken } from './lib/refreshToken';
import { handleWebhookEvent, stripe } from './services/stripeService';
import { generateRecurringTransactions } from './services/recurringGenerator';

// Prefix cell values that could be interpreted as spreadsheet formulas
// (CSV/Excel formula injection) with a single quote so they're treated as text.
function escapeCsvFormula(value: string): string {
  if (/^[=+\-@]/.test(value)) return `'${value}`;
  return value;
}

const app = express();
app.set('trust proxy', 1);

app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));
app.use(helmet());
const allowedOrigins = new Set(env.CORS_ORIGIN.split(',').map((o) => o.trim()));
logger.info({ corsOrigins: [...allowedOrigins] }, 'CORS allowed origins');
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = !origin || allowedOrigins.has(origin);
      if (!allowed) logger.warn({ origin }, 'CORS rejected origin');
      cb(null, allowed);
    },
    credentials: true,
  }),
);

// Stripe webhook needs raw body — must be registered before express.json()
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig || typeof sig !== 'string') throw new AppError('Missing Stripe signature', 400);
      const event = stripe().webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (err) {
      if (err instanceof AppError) {
        next(err);
        return;
      }
      logger.error({ err }, 'Webhook signature verification failed');
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  },
);

app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unhealthy', error: 'Database unreachable' });
  }
});

// POST /api/auth/refresh — plain Express route consumed by the tRPC client's refresh handler
app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return void res.status(400).json({ error: 'Refresh token is required' });
    }
    const record = await consumeRefreshToken(refreshToken);
    if (!record) {
      return void res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const token = generateToken(record.userId);
    const newRefreshToken = await createRefreshToken(record.userId);

    generateRecurringTransactions(record.userId).catch((err) => {
      logger.error({ err, userId: record.userId }, 'Failed to generate recurring transactions');
    });

    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/export/csv — streaming download, kept outside tRPC
app.get('/api/transactions/export/csv', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { type, categoryId, startDate, endDate, search } = req.query;

    const where: Prisma.TransactionWhereInput = { userId, deletedAt: null };
    if (type && (type === 'expense' || type === 'income')) where.type = type;
    if (categoryId && typeof categoryId === 'string') where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === 'string')
        (where.date as Prisma.DateTimeFilter).gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate && typeof endDate === 'string')
        (where.date as Prisma.DateTimeFilter).lte = new Date(endDate + 'T23:59:59.999Z');
    }
    if (search && typeof search === 'string')
      where.description = { contains: search, mode: 'insensitive' };

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');

    const stringifier = stringify({
      header: true,
      columns: ['Date', 'Type', 'Description', 'Amount', 'Category', 'Subcategory', 'Notes'],
    });
    stringifier.pipe(res);

    const PAGE_SIZE = 1000;
    let cursor: string | undefined;

    for (;;) {
      const page = await prisma.transaction.findMany({
        where,
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
        },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        take: PAGE_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      if (page.length === 0) break;

      for (const t of page) {
        stringifier.write([
          new Date(t.date).toISOString().split('T')[0],
          t.type,
          escapeCsvFormula(t.description),
          t.amount.toString(),
          escapeCsvFormula(t.category.name),
          escapeCsvFormula(t.subcategory?.name || ''),
          escapeCsvFormula(t.notes || ''),
        ]);
      }

      if (page.length < PAGE_SIZE) break;
      cursor = page[page.length - 1].id;
    }

    stringifier.end();
  } catch (err) {
    next(err);
  }
});

// tRPC handler — all application procedures live here
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        Sentry.captureException(error.cause ?? error);
        logger.error({ err: error.cause, path }, 'tRPC internal error');
      } else {
        logger.warn({ err: error.message, path, code: error.code }, 'tRPC error');
      }
    },
  }),
);

// Sentry error handler must come before the custom error handler
Sentry.setupExpressErrorHandler(app);

// Error handler (must be last)
app.use(errorHandler);

export default app;
