import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().default('/api'),
  VITE_SENTRY_DSN: z.string().default(''),
});

export const env = envSchema.parse(import.meta.env);
