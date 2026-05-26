import 'dotenv/config';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'production',
  sendDefaultPii: true,
  includeLocalVariables: true,
  enableLogs: true,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
});
