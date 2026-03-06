import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().default('http://localhost:3001'),
  EXPO_PUBLIC_ENV: z.enum(['development', 'production', 'staging']).default('development'),
  EXPO_PUBLIC_SENTRY_DSN: z.string().default(''),
});

export const env = envSchema.parse(process.env);
