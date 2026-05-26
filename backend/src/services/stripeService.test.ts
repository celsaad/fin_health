import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type Stripe from 'stripe';
import { handleWebhookEvent } from './stripeService';
import prisma from '../lib/prisma';
import { createTestUser, cleanupUser } from '../test/helpers';

function makeEvent<T>(type: string, object: T): Stripe.Event {
  return { type, data: { object }, id: 'evt_test' } as unknown as Stripe.Event;
}

describe('handleWebhookEvent', () => {
  let userId: string;
  let subscriptionId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupUser(userId);
  });

  describe('checkout.session.completed', () => {
    it('activates pro plan on first checkout', async () => {
      await handleWebhookEvent(
        makeEvent('checkout.session.completed', {
          mode: 'subscription',
          customer: 'cus_test_001',
          subscription: 'sub_test_001',
          metadata: { userId },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { userId } });
      expect(sub?.plan).toBe('pro');
      expect(sub?.status).toBe('active');
      expect(sub?.stripeCustomerId).toBe('cus_test_001');
      expect(sub?.stripeSubscriptionId).toBe('sub_test_001');
    });

    it('upgrades existing free subscription to pro', async () => {
      await prisma.subscription.create({
        data: { userId, plan: 'free', status: 'active', stripeCustomerId: 'cus_test_002' },
      });

      await handleWebhookEvent(
        makeEvent('checkout.session.completed', {
          mode: 'subscription',
          customer: 'cus_test_002',
          subscription: 'sub_test_002',
          metadata: { userId },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { userId } });
      expect(sub?.plan).toBe('pro');
      expect(sub?.status).toBe('active');
      expect(sub?.stripeCustomerId).toBe('cus_test_002');
      expect(sub?.stripeSubscriptionId).toBe('sub_test_002');
    });

    it('ignores non-subscription checkout sessions', async () => {
      await handleWebhookEvent(
        makeEvent('checkout.session.completed', {
          mode: 'payment',
          customer: 'cus_test_003',
          metadata: { userId },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { userId } });
      expect(sub).toBeNull();
    });

    it('ignores events with no userId in metadata', async () => {
      await handleWebhookEvent(
        makeEvent('checkout.session.completed', {
          mode: 'subscription',
          customer: 'cus_test_004',
          subscription: 'sub_test_004',
          metadata: {},
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { userId } });
      expect(sub).toBeNull();
    });
  });

  describe('invoice.paid', () => {
    beforeEach(async () => {
      const record = await prisma.subscription.create({
        data: {
          userId,
          plan: 'pro',
          status: 'active',
          stripeSubscriptionId: 'sub_inv_test',
        },
      });
      subscriptionId = record.id;
    });

    it('renews subscription and updates currentPeriodEnd', async () => {
      const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

      await handleWebhookEvent(
        makeEvent('invoice.paid', {
          id: 'in_test',
          customer: 'cus_test',
          parent: {
            subscription_details: { subscription: 'sub_inv_test' },
          },
          lines: {
            data: [{ period: { end: periodEnd } }],
          },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      expect(sub?.status).toBe('active');
      expect(sub?.currentPeriodEnd).toEqual(new Date(periodEnd * 1000));
    });

    it('does nothing when stripeSubscriptionId is not found', async () => {
      await expect(
        handleWebhookEvent(
          makeEvent('invoice.paid', {
            id: 'in_test',
            customer: 'cus_test',
            parent: { subscription_details: { subscription: 'sub_unknown' } },
            lines: { data: [] },
          }),
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('customer.subscription.updated', () => {
    beforeEach(async () => {
      const record = await prisma.subscription.create({
        data: {
          userId,
          plan: 'pro',
          status: 'active',
          stripeSubscriptionId: 'sub_upd_test',
        },
      });
      subscriptionId = record.id;
    });

    it('marks cancelAtPeriodEnd when subscription will cancel', async () => {
      await handleWebhookEvent(
        makeEvent('customer.subscription.updated', {
          id: 'sub_upd_test',
          status: 'active',
          cancel_at_period_end: true,
          items: { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 3600 }] },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      expect(sub?.cancelAtPeriodEnd).toBe(true);
      expect(sub?.status).toBe('active');
    });

    it('maps trialing status correctly', async () => {
      await handleWebhookEvent(
        makeEvent('customer.subscription.updated', {
          id: 'sub_upd_test',
          status: 'trialing',
          cancel_at_period_end: false,
          items: { data: [] },
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      expect(sub?.status).toBe('trialing');
    });
  });

  describe('customer.subscription.deleted', () => {
    beforeEach(async () => {
      const record = await prisma.subscription.create({
        data: {
          userId,
          plan: 'pro',
          status: 'active',
          stripeSubscriptionId: 'sub_del_test',
        },
      });
      subscriptionId = record.id;
    });

    it('reverts subscription to free/expired on deletion', async () => {
      await handleWebhookEvent(
        makeEvent('customer.subscription.deleted', {
          id: 'sub_del_test',
          status: 'canceled',
        }),
      );

      const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      expect(sub?.plan).toBe('free');
      expect(sub?.status).toBe('expired');
      expect(sub?.cancelAtPeriodEnd).toBe(false);
    });
  });
});
