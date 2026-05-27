import './instrument'; // must be first — initializes Sentry before any other modules load
import * as Sentry from '@sentry/node';
import app from './app';
import prisma from './lib/prisma';
import { logger } from './lib/logger';
import { env } from './lib/env';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received, draining connections');
  server.close(async () => {
    await prisma.$disconnect();
    await Sentry.flush(2000);
    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown stalls
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

prisma
  .$connect()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error({ err }, 'Database connection failed'));

setInterval(() => {
  const { heapUsed, rss } = process.memoryUsage();
  logger.info(
    { heapUsedMb: Math.round(heapUsed / 1024 / 1024), rssMb: Math.round(rss / 1024 / 1024) },
    'Heartbeat',
  );
}, 60_000).unref();
