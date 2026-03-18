import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: '.',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
    sequence: { concurrent: false },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://finhealth:finhealth_ci_password@localhost:5432/finhealth?schema=public',
      JWT_SECRET: 'test-secret-key-for-vitest-only-do-not-use-in-prod',
      STRIPE_SECRET_KEY: 'sk_test_fake_key_for_testing',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_fake_secret',
      STRIPE_PRO_MONTHLY_PRICE_ID: 'price_test_monthly',
      STRIPE_PRO_YEARLY_PRICE_ID: 'price_test_yearly',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
