import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import {
  api,
  callerFor,
  publicCaller,
  createTestUser,
  cleanupUser,
  TestUser,
} from '../test/helpers';
import prisma from '../lib/prisma';

vi.mock('../services/stripeService', () => ({
  createCheckoutSession: vi.fn().mockResolvedValue('https://checkout.stripe.com/test-session'),
  createPortalSession: vi.fn().mockResolvedValue('https://billing.stripe.com/test-portal'),
  handleWebhookEvent: vi.fn().mockResolvedValue(undefined),
  stripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(() => {
        throw new Error('Invalid signature');
      }),
    },
  })),
}));

describe('Billing procedures', () => {
  let freeUser: TestUser;
  let proUser: TestUser;

  beforeAll(async () => {
    freeUser = await createTestUser();
    proUser = await createTestUser();

    await prisma.subscription.create({
      data: { userId: proUser.id, plan: 'pro', status: 'active', stripeCustomerId: 'cus_test_123' },
    });
  });

  afterAll(async () => {
    await cleanupUser(freeUser.id);
    await cleanupUser(proUser.id);
  });

  describe('billing.checkout', () => {
    it('requires authentication', async () => {
      await expect(publicCaller().billing.checkout({ interval: 'monthly' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects invalid interval', async () => {
      const caller = await callerFor(freeUser);
      await expect(
        caller.billing.checkout({ interval: 'weekly' as 'monthly' }),
      ).rejects.toBeInstanceOf(TRPCError);
    });

    it('returns checkout URL for valid monthly request', async () => {
      const caller = await callerFor(freeUser);
      const result = await caller.billing.checkout({ interval: 'monthly' });
      expect(result.url).toBe('https://checkout.stripe.com/test-session');
    });

    it('accepts yearly interval', async () => {
      const caller = await callerFor(freeUser);
      const result = await caller.billing.checkout({ interval: 'yearly' });
      expect(result.url).toBe('https://checkout.stripe.com/test-session');
    });
  });

  describe('billing.portal', () => {
    it('requires authentication', async () => {
      await expect(publicCaller().billing.portal()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('returns portal URL for authenticated user', async () => {
      const caller = await callerFor(proUser);
      const result = await caller.billing.portal();
      expect(result.url).toBe('https://billing.stripe.com/test-portal');
    });
  });

  // Webhook is a plain Express route — test with Supertest
  describe('POST /api/billing/webhook', () => {
    it('rejects requests without Stripe signature', async () => {
      const res = await api()
        .post('/api/billing/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'test' }));

      expect(res.status).toBe(400);
    });

    it('rejects requests with invalid signature', async () => {
      const res = await api()
        .post('/api/billing/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'invalid_sig')
        .send(JSON.stringify({ type: 'test' }));

      expect(res.status).toBe(400);
    });
  });
});
