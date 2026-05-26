import { describe, it, expect, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { publicCaller, callerFor, createTestUser, cleanupUser, uniqueEmail } from '../test/helpers';

describe('Auth procedures', () => {
  const userIds: string[] = [];
  afterEach(async () => {
    for (const id of userIds) await cleanupUser(id);
    userIds.length = 0;
  });

  describe('auth.signup', () => {
    it('creates a new user and returns a token', async () => {
      const email = uniqueEmail();
      const caller = publicCaller();
      const result = await caller.auth.signup({ email, password: 'Test1234!', name: 'Test' });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
      expect((result.user as Record<string, unknown>).password).toBeUndefined();
      userIds.push(result.user.id);
    });

    it('rejects duplicate email', async () => {
      const user = await createTestUser();
      userIds.push(user.id);
      const caller = publicCaller();

      await expect(
        caller.auth.signup({ email: user.email, password: 'Test1234!', name: 'Test' }),
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('rejects invalid input', async () => {
      const caller = publicCaller();
      await expect(
        caller.auth.signup({ email: 'not-an-email', password: '12', name: '' }),
      ).rejects.toBeInstanceOf(TRPCError);
    });
  });

  describe('auth.login', () => {
    it('returns a token for valid credentials', async () => {
      const email = uniqueEmail();
      const password = 'Test1234!';
      const user = await createTestUser({ email, password });
      userIds.push(user.id);
      const caller = publicCaller();

      const result = await caller.auth.login({ email, password });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
    });

    it('rejects wrong password', async () => {
      const user = await createTestUser();
      userIds.push(user.id);
      const caller = publicCaller();

      await expect(
        caller.auth.login({ email: user.email, password: 'wrongpassword' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('rejects non-existent email', async () => {
      const caller = publicCaller();
      await expect(
        caller.auth.login({ email: 'no-one@test.com', password: 'Test1234!' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('auth.me', () => {
    it('returns the authenticated user', async () => {
      const user = await createTestUser();
      userIds.push(user.id);
      const caller = await callerFor(user);

      const result = await caller.auth.me();

      expect(result.user.id).toBe(user.id);
      expect((result.user as Record<string, unknown>).password).toBeUndefined();
    });

    it('rejects unauthenticated request', async () => {
      const caller = publicCaller();
      await expect(caller.auth.me()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('auth.changePassword', () => {
    it('changes password and returns new token', async () => {
      const user = await createTestUser({ password: 'OldPass123!' });
      userIds.push(user.id);
      const caller = await callerFor(user);

      const result = await caller.auth.changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      });

      expect(result.token).toBeDefined();
    });

    it('rejects wrong current password', async () => {
      const user = await createTestUser({ password: 'Correct123!' });
      userIds.push(user.id);
      const caller = await callerFor(user);

      await expect(
        caller.auth.changePassword({ currentPassword: 'Wrong123!', newPassword: 'NewPass456!' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('auth.exportData', () => {
    it('exports all user data', async () => {
      const user = await createTestUser();
      userIds.push(user.id);
      const caller = await callerFor(user);

      // Create a transaction first
      await caller.transactions.create({
        amount: '100',
        type: 'expense',
        description: 'Export test',
        date: '2025-01-01',
        categoryName: 'TestCat',
      });

      const result = await caller.auth.exportData();

      expect(result.exportedAt).toBeDefined();
      expect(result.data.id).toBe(user.id);
      expect(result.data.email).toBe(user.email);
      expect((result.data as Record<string, unknown>).password).toBeUndefined();
      expect(result.data.categories).toBeInstanceOf(Array);
      expect(result.data.transactions).toBeInstanceOf(Array);
      expect(result.data.transactions.length).toBeGreaterThan(0);
      expect(result.data.budgets).toBeInstanceOf(Array);
      expect(result.data.recurringTransactions).toBeInstanceOf(Array);
    });

    it('rejects unauthenticated request', async () => {
      const caller = publicCaller();
      await expect(caller.auth.exportData()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('auth.deleteAccount', () => {
    it('permanently deletes user account', async () => {
      const password = 'DeleteMe123!';
      const user = await createTestUser({ password });
      const caller = await callerFor(user);

      const result = await caller.auth.deleteAccount({ password });

      expect(result.message).toContain('permanently deleted');

      // Verify account is gone
      const newCaller = await callerFor(user);
      await expect(newCaller.auth.me()).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('rejects incorrect password', async () => {
      const user = await createTestUser({ password: 'Correct123!' });
      userIds.push(user.id);
      const caller = await callerFor(user);

      await expect(caller.auth.deleteAccount({ password: 'Wrong123!' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects missing password (empty string)', async () => {
      const user = await createTestUser();
      userIds.push(user.id);
      const caller = await callerFor(user);

      await expect(caller.auth.deleteAccount({ password: '' })).rejects.toBeInstanceOf(TRPCError);
    });

    it('rejects unauthenticated request', async () => {
      const caller = publicCaller();
      await expect(caller.auth.deleteAccount({ password: 'test' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
