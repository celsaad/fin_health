import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== 'production' && {
    transport: { target: 'pino/file', options: { destination: 1 } },
    formatters: { level: (label: string) => ({ level: label }) },
  }),
});
