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
