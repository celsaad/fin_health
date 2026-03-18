import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { api, createTestUser, cleanupUser, TestUser } from '../test/helpers';
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

describe('Billing routes', () => {
  let freeUser: TestUser;
  let proUser: TestUser;

  beforeAll(async () => {
    freeUser = await createTestUser();
    proUser = await createTestUser();

    await prisma.subscription.create({
      data: {
        userId: proUser.id,
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_test_123',
      },
    });
  });

  afterAll(async () => {
    await cleanupUser(freeUser.id);
    await cleanupUser(proUser.id);
  });

  describe('POST /api/billing/checkout', () => {
    it('requires authentication', async () => {
      const res = await api().post('/api/billing/checkout').send({ interval: 'monthly' });
      expect(res.status).toBe(401);
    });

    it('rejects invalid interval', async () => {
      const res = await api()
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${freeUser.token}`)
        .send({ interval: 'weekly' });

      expect(res.status).toBe(400);
    });

    it('returns checkout URL for valid request', async () => {
      const res = await api()
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${freeUser.token}`)
        .send({ interval: 'monthly' });

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://checkout.stripe.com/test-session');
    });

    it('accepts yearly interval', async () => {
      const res = await api()
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${freeUser.token}`)
        .send({ interval: 'yearly' });

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://checkout.stripe.com/test-session');
    });
  });

  describe('GET /api/billing/portal', () => {
    it('requires authentication', async () => {
      const res = await api().get('/api/billing/portal');
      expect(res.status).toBe(401);
    });

    it('returns portal URL for authenticated user', async () => {
      const res = await api()
        .get('/api/billing/portal')
        .set('Authorization', `Bearer ${proUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://billing.stripe.com/test-portal');
    });
  });

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
