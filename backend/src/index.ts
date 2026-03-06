import { initSentry } from './lib/sentry';
import app from './app';
import prisma from './lib/prisma';
import { logger } from './lib/logger';
import { env } from './lib/env';

initSentry();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received, draining connections');
  server.close(async () => {
    await prisma.$disconnect();
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
