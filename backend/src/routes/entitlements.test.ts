import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createTestUser, cleanupUser, TestUser } from '../test/helpers';
import prisma from '../lib/prisma';

describe('Entitlements', () => {
  let freeUser: TestUser;
  let proUser: TestUser;

  beforeAll(async () => {
    freeUser = await createTestUser();
    proUser = await createTestUser();

    // Give proUser a pro subscription
    await prisma.subscription.create({
      data: {
        userId: proUser.id,
        plan: 'pro',
        status: 'active',
      },
    });
  });

  afterAll(async () => {
    await cleanupUser(freeUser.id);
    await cleanupUser(proUser.id);
  });

  describe('GET /api/auth/me — plan info', () => {
    it('returns free plan when user has no subscription', async () => {
      const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${freeUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.plan).toEqual({
        plan: 'free',
        status: 'active',
        trialEndsAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    });

    it('returns pro plan when user has active subscription', async () => {
      const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${proUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.plan.plan).toBe('pro');
      expect(res.body.user.plan.status).toBe('active');
    });
  });

  describe('POST /api/auth/signup — plan info', () => {
    it('returns free plan for new users', async () => {
      const res = await api()
        .post('/api/auth/signup')
        .send({
          email: `entitlement-test-${Date.now()}@test.com`,
          password: 'Test1234!',
          name: 'Test',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.plan.plan).toBe('free');

      // cleanup
      await cleanupUser(res.body.user.id);
    });
  });

  describe('POST /api/auth/login — plan info', () => {
    it('returns plan info on login', async () => {
      const email = `entitlement-login-${Date.now()}@test.com`;
      const password = 'Test1234!';
      const signupRes = await api()
        .post('/api/auth/signup')
        .send({ email, password, name: 'Test' });
      const userId = signupRes.body.user.id;

      const res = await api().post('/api/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.user.plan.plan).toBe('free');

      await cleanupUser(userId);
    });
  });

  describe('GET /api/dashboard/insights — pro gating', () => {
    it('returns 403 with PRO_REQUIRED for free user', async () => {
      const res = await api()
        .get('/api/dashboard/insights?month=3&year=2025')
        .set('Authorization', `Bearer ${freeUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PRO_REQUIRED');
    });

    it('returns 200 for pro user', async () => {
      const res = await api()
        .get('/api/dashboard/insights?month=3&year=2025')
        .set('Authorization', `Bearer ${proUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.insights).toBeInstanceOf(Array);
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
        data: {
          userId: canceledUser.id,
          plan: 'pro',
          status: 'canceled',
        },
      });

      await prisma.subscription.create({
        data: {
          userId: expiredUser.id,
          plan: 'pro',
          status: 'expired',
        },
      });
    });

    afterAll(async () => {
      await cleanupUser(trialingUser.id);
      await cleanupUser(canceledUser.id);
      await cleanupUser(expiredUser.id);
    });

    it('allows trialing users to access pro features', async () => {
      const res = await api()
        .get('/api/dashboard/insights?month=3&year=2025')
        .set('Authorization', `Bearer ${trialingUser.token}`);

      expect(res.status).toBe(200);
    });

    it('blocks canceled users from pro features', async () => {
      const res = await api()
        .get('/api/dashboard/insights?month=3&year=2025')
        .set('Authorization', `Bearer ${canceledUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PRO_REQUIRED');
    });

    it('blocks expired users from pro features', async () => {
      const res = await api()
        .get('/api/dashboard/insights?month=3&year=2025')
        .set('Authorization', `Bearer ${expiredUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PRO_REQUIRED');
    });
  });

  describe('non-gated routes — unaffected', () => {
    it('free users can access dashboard summary', async () => {
      const res = await api()
        .get('/api/dashboard/summary?month=3&year=2025')
        .set('Authorization', `Bearer ${freeUser.token}`);

      expect(res.status).toBe(200);
    });

    it('free users can access dashboard breakdown', async () => {
      const res = await api()
        .get('/api/dashboard/breakdown?month=3&year=2025')
        .set('Authorization', `Bearer ${freeUser.token}`);

      expect(res.status).toBe(200);
    });
  });
});
