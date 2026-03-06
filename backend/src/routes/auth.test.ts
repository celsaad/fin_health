import { describe, it, expect, afterEach } from 'vitest';
import { api, createTestUser, cleanupUser, uniqueEmail } from '../test/helpers';

describe('Auth routes', () => {
  const userIds: string[] = [];
  afterEach(async () => {
    for (const id of userIds) await cleanupUser(id);
    userIds.length = 0;
  });

  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns a token', async () => {
      const email = uniqueEmail();
      const res = await api()
        .post('/api/auth/signup')
        .send({ email, password: 'Test1234!', name: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email);
      expect(res.body.user).not.toHaveProperty('password');
      userIds.push(res.body.user.id);
    });

    it('rejects duplicate email', async () => {
      const user = await createTestUser();
      userIds.push(user.id);

      const res = await api()
        .post('/api/auth/signup')
        .send({ email: user.email, password: 'Test1234!', name: 'Test' });

      expect(res.status).toBe(409);
    });

    it('rejects invalid input', async () => {
      const res = await api()
        .post('/api/auth/signup')
        .send({ email: 'not-an-email', password: '12', name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials', async () => {
      const email = uniqueEmail();
      const password = 'Test1234!';
      const user = await createTestUser({ email, password });
      userIds.push(user.id);

      const res = await api().post('/api/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email);
    });

    it('rejects wrong password', async () => {
      const user = await createTestUser();
      userIds.push(user.id);

      const res = await api()
        .post('/api/auth/login')
        .send({ email: user.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects non-existent email', async () => {
      const res = await api()
        .post('/api/auth/login')
        .send({ email: 'no-one@test.com', password: 'Test1234!' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the authenticated user', async () => {
      const user = await createTestUser();
      userIds.push(user.id);

      const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects unauthenticated request', async () => {
      const res = await api().get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects invalid token', async () => {
      const res = await api().get('/api/auth/me').set('Authorization', 'Bearer bad-token');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/password', () => {
    it('changes password and returns new token', async () => {
      const user = await createTestUser({ password: 'OldPass123!' });
      userIds.push(user.id);

      const res = await api()
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ currentPassword: 'OldPass123!', newPassword: 'NewPass456!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('invalidates old token after password change', async () => {
      const user = await createTestUser({ password: 'OldPass123!' });
      userIds.push(user.id);
      const oldToken = user.token;

      // Wait 1s so the token's iat (seconds) is strictly before the passwordChangedAt
      await new Promise((r) => setTimeout(r, 1100));

      // Change password
      await api()
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${oldToken}`)
        .send({ currentPassword: 'OldPass123!', newPassword: 'NewPass456!' });

      // Old token should be rejected
      const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`);

      expect(res.status).toBe(401);
    });

    it('rejects wrong current password', async () => {
      const user = await createTestUser({ password: 'Correct123!' });
      userIds.push(user.id);

      const res = await api()
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ currentPassword: 'Wrong123!', newPassword: 'NewPass456!' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/export (GDPR)', () => {
    it('exports all user data as JSON', async () => {
      const user = await createTestUser();
      userIds.push(user.id);

      // Create some data to export
      await api().post('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({
        amount: 100,
        type: 'expense',
        description: 'Export test',
        date: '2025-01-01',
        categoryName: 'TestCat',
      });

      const res = await api().get('/api/auth/export').set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toContain('user-data-export.json');
      expect(res.body.exportedAt).toBeDefined();
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe(user.email);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data.categories).toBeInstanceOf(Array);
      expect(res.body.data.transactions).toBeInstanceOf(Array);
      expect(res.body.data.transactions.length).toBeGreaterThan(0);
      expect(res.body.data.budgets).toBeInstanceOf(Array);
      expect(res.body.data.recurringTransactions).toBeInstanceOf(Array);
    });

    it('rejects unauthenticated request', async () => {
      const res = await api().get('/api/auth/export');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/auth/account (GDPR)', () => {
    it('permanently deletes user account with password confirmation', async () => {
      const password = 'DeleteMe123!';
      const user = await createTestUser({ password });
      // Don't push to userIds — we're deleting in the test

      // Create data so we can verify cascade delete
      await api().post('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({
        amount: 50,
        type: 'expense',
        description: 'Will be deleted',
        date: '2025-01-01',
        categoryName: 'Temp',
      });

      const res = await api()
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ password });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('permanently deleted');

      // Verify the token no longer works
      const meRes = await api().get('/api/auth/me').set('Authorization', `Bearer ${user.token}`);
      expect(meRes.status).toBe(401);
    });

    it('rejects incorrect password', async () => {
      const user = await createTestUser({ password: 'Correct123!' });
      userIds.push(user.id);

      const res = await api()
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ password: 'Wrong123!' });

      expect(res.status).toBe(401);
    });

    it('rejects missing password', async () => {
      const user = await createTestUser();
      userIds.push(user.id);

      const res = await api()
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${user.token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await api().delete('/api/auth/account').send({ password: 'test' });
      expect(res.status).toBe(401);
    });
  });
});
