import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { callerFor, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Recurring transaction procedures', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  async function createRecurring(overrides: Record<string, unknown> = {}) {
    const caller = await callerFor(user);
    return caller.recurring.create({
      amount: '50',
      type: 'expense',
      description: 'Test subscription',
      frequency: 'monthly',
      startDate: '2025-01-01',
      categoryName: 'Food',
      ...overrides,
    } as Parameters<typeof caller.recurring.create>[0]);
  }

  describe('recurring.create', () => {
    it('defaults currency to USD when not provided', async () => {
      const result = await createRecurring({ description: 'USD subscription' });

      expect(result.recurringTransaction.currency).toBe('USD');
    });

    it('persists and returns a non-USD currency', async () => {
      const result = await createRecurring({
        description: 'BRL subscription',
        currency: 'brl',
      });

      expect(result.recurringTransaction.currency).toBe('BRL');

      const caller = await callerFor(user);
      const fetched = await caller.recurring.byId({ id: result.recurringTransaction.id });
      expect(fetched.recurringTransaction.currency).toBe('BRL');
    });
  });

  describe('recurring.update', () => {
    it('updates the currency when provided', async () => {
      const created = await createRecurring({ description: 'Currency update test' });

      const caller = await callerFor(user);
      const updated = await caller.recurring.update({
        id: created.recurringTransaction.id,
        currency: 'eur',
      });

      expect(updated.recurringTransaction.currency).toBe('EUR');
    });

    it('leaves currency unchanged when not provided', async () => {
      const created = await createRecurring({ description: 'No currency change', currency: 'gbp' });

      const caller = await callerFor(user);
      const updated = await caller.recurring.update({
        id: created.recurringTransaction.id,
        amount: '75',
      });

      expect(updated.recurringTransaction.currency).toBe('GBP');
      expect(updated.recurringTransaction.amount).toBe(75);
    });
  });
});
