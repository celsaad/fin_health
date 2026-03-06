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
      JWT_SECRET: 'test-secret-key-for-vitest-only-do-not-use-in-prod',
    },
  },
});
