import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { callerFor, publicCaller, createTestUser, cleanupUser, TestUser } from '../test/helpers';
import prisma from '../lib/prisma';

describe('Entitlements', () => {
  let freeUser: TestUser;
  let proUser: TestUser;

  beforeAll(async () => {
    freeUser = await createTestUser();
    proUser = await createTestUser();

    await prisma.subscription.create({
      data: { userId: proUser.id, plan: 'pro', status: 'active' },
    });
  });

  afterAll(async () => {
    await cleanupUser(freeUser.id);
    await cleanupUser(proUser.id);
  });

  describe('auth.me — plan info', () => {
    it('returns free plan when user has no subscription', async () => {
      const caller = await callerFor(freeUser);
      const result = await caller.auth.me();

      expect(result.user.plan).toEqual({
        plan: 'free',
        status: 'active',
        trialEndsAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    });

    it('returns pro plan when user has active subscription', async () => {
      const caller = await callerFor(proUser);
      const result = await caller.auth.me();

      expect(result.user.plan.plan).toBe('pro');
      expect(result.user.plan.status).toBe('active');
    });
  });

  describe('auth.signup — plan info', () => {
    it('returns free plan for new users', async () => {
      const caller = publicCaller();
      const result = await caller.auth.signup({
        email: `entitlement-test-${Date.now()}@test.com`,
        password: 'Test1234!',
        name: 'Test',
      });

      expect(result.user.plan.plan).toBe('free');
      await cleanupUser(result.user.id);
    });
  });

  describe('auth.login — plan info', () => {
    it('returns plan info on login', async () => {
      const email = `entitlement-login-${Date.now()}@test.com`;
      const password = 'Test1234!';
      const signupResult = await publicCaller().auth.signup({ email, password, name: 'Test' });
      const userId = signupResult.user.id;

      const loginResult = await publicCaller().auth.login({ email, password });
      expect(loginResult.user.plan.plan).toBe('free');

      await cleanupUser(userId);
    });
  });

  describe('dashboard.insights — pro gating', () => {
    it('returns FORBIDDEN with PRO_REQUIRED for free user', async () => {
      const caller = await callerFor(freeUser);
      const error = await caller.dashboard.insights({ month: 3, year: 2025 }).catch((e) => e);

      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('PRO_REQUIRED');
    });

    it('returns insights for pro user', async () => {
      const caller = await callerFor(proUser);
      const result = await caller.dashboard.insights({ month: 3, year: 2025 });

      expect(result.insights).toBeInstanceOf(Array);
    });
  });

  describe('requirePro — subscription status checks', () => {
    let trialingUser: TestUser;
    let canceledUser: TestUser;
    let expiredUser: TestUser;

    beforeAll(async () => {
      trialingUser = await createTestUser();
      canceledUser = await createTestUser();
      expiredUser = await createTestUser();

      await prisma.subscription.create({
        data: {
          userId: trialingUser.id,
          plan: 'pro',
          status: 'trialing',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      await prisma.subscription.create({
        data: { userId: canceledUser.id, plan: 'pro', status: 'canceled' },
      });
      await prisma.subscription.create({
        data: { userId: expiredUser.id, plan: 'pro', status: 'expired' },
      });
    });

    afterAll(async () => {
      await cleanupUser(trialingUser.id);
      await cleanupUser(canceledUser.id);
      await cleanupUser(expiredUser.id);
    });

    it('allows trialing users to access pro features', async () => {
      const caller = await callerFor(trialingUser);
      const result = await caller.dashboard.insights({ month: 3, year: 2025 });
      expect(result.insights).toBeInstanceOf(Array);
    });

    it('blocks canceled users from pro features', async () => {
      const caller = await callerFor(canceledUser);
      const error = await caller.dashboard.insights({ month: 3, year: 2025 }).catch((e) => e);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('PRO_REQUIRED');
    });

    it('blocks expired users from pro features', async () => {
      const caller = await callerFor(expiredUser);
      const error = await caller.dashboard.insights({ month: 3, year: 2025 }).catch((e) => e);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('PRO_REQUIRED');
    });
  });

  describe('non-gated routes — unaffected', () => {
    it('free users can access dashboard summary', async () => {
      const caller = await callerFor(freeUser);
      const result = await caller.dashboard.summary({ month: 3, year: 2025 });
      expect(result.transactionCount).toBeGreaterThanOrEqual(0);
    });

    it('free users can access dashboard breakdown', async () => {
      const caller = await callerFor(freeUser);
      const result = await caller.dashboard.breakdown({ month: 3, year: 2025 });
      expect(result.breakdown).toBeInstanceOf(Array);
    });
  });
});
