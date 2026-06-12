import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TRPCError } from '@trpc/server';
import { callerFor, publicCaller, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Budget procedures', () => {
  let user: TestUser;
  let categoryId: string;

  beforeAll(async () => {
    user = await createTestUser();
    const caller = await callerFor(user);
    const tx = await caller.transactions.create({
      amount: '100',
      type: 'expense',
      description: 'Budget test expense',
      date: '2025-03-15',
      categoryName: 'Groceries',
    });
    categoryId = tx.transaction.category.id;
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  describe('budgets.upsert', () => {
    it('creates a monthly budget without category (overall)', async () => {
      const caller = await callerFor(user);
      const result = await caller.budgets.upsert({ amount: '2000', month: 3, year: 2025 });

      expect(result.budget).toBeDefined();
      expect(result.budget.amount).toBe(2000);
      expect(result.budget.month).toBe(3);
      expect(result.budget.year).toBe(2025);
    });

    it('creates a category-specific budget', async () => {
      const caller = await callerFor(user);
      const result = await caller.budgets.upsert({
        amount: '500',
        month: 3,
        year: 2025,
        categoryId,
      });

      expect(result.budget.categoryId).toBe(categoryId);
    });

    it('creates a recurring budget', async () => {
      const caller = await callerFor(user);
      const result = await caller.budgets.upsert({ amount: '1500', isRecurring: true, categoryId });

      expect(result.budget.isRecurring).toBe(true);
      expect(result.budget.month).toBe(0);
      expect(result.budget.year).toBe(0);
    });

    it('upserts on duplicate month/year/category', async () => {
      const caller = await callerFor(user);
      await caller.budgets.upsert({ amount: '300', month: 6, year: 2025, categoryId });
      const result = await caller.budgets.upsert({
        amount: '400',
        month: 6,
        year: 2025,
        categoryId,
      });

      expect(result.budget.amount).toBe(400);
    });

    it('rejects non-recurring budget without month/year', async () => {
      const caller = await callerFor(user);
      await expect(caller.budgets.upsert({ amount: '500' } as never)).rejects.toBeInstanceOf(
        TRPCError,
      );
    });

    it('rejects invalid categoryId', async () => {
      const caller = await callerFor(user);
      await expect(
        caller.budgets.upsert({ amount: '500', month: 3, year: 2025, categoryId: 'nonexistent' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('budgets.list', () => {
    it('returns budgets with spent calculation', async () => {
      const caller = await callerFor(user);
      const result = await caller.budgets.list({ month: 3, year: 2025 });

      expect(result.budgets).toBeInstanceOf(Array);
      expect(result.budgets.length).toBeGreaterThan(0);
      for (const budget of result.budgets) {
        expect(budget.spent).toBeDefined();
        expect(budget.remaining).toBeDefined();
      }
    });

    it('includes recurring budgets in results', async () => {
      const caller = await callerFor(user);
      const result = await caller.budgets.list({ month: 1, year: 2025 });

      const recurring = result.budgets.filter((b) => b.isRecurring);
      expect(recurring.length).toBeGreaterThan(0);
    });

    it('rejects unauthenticated request', async () => {
      await expect(publicCaller().budgets.list({ month: 3, year: 2025 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('rejects invalid month', async () => {
      const caller = await callerFor(user);
      await expect(caller.budgets.list({ month: 13, year: 2025 })).rejects.toBeInstanceOf(
        TRPCError,
      );
    });
  });

  describe('budgets.delete', () => {
    it('deletes a budget', async () => {
      const caller = await callerFor(user);
      const createResult = await caller.budgets.upsert({ amount: '999', month: 12, year: 2025 });
      const budgetId = createResult.budget.id;

      const result = await caller.budgets.delete({ id: budgetId });
      expect(result.message).toBe('Budget deleted');
    });

    it('returns NOT_FOUND for non-existent budget', async () => {
      const caller = await callerFor(user);
      await expect(caller.budgets.delete({ id: 'nonexistent-id' })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it("cannot delete another user's budget", async () => {
      const other = await createTestUser();
      const caller = await callerFor(user);
      const createResult = await caller.budgets.upsert({ amount: '100', month: 11, year: 2025 });
      const budgetId = createResult.budget.id;

      const otherCaller = await callerFor(other);
      await expect(otherCaller.budgets.delete({ id: budgetId })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await cleanupUser(other.id);
    });
  });

  describe('budgets.copyPrevious', () => {
    it('copies budgets from previous month', async () => {
      const caller = await callerFor(user);
      await caller.budgets.upsert({ amount: '800', month: 4, year: 2025, categoryId });
      const result = await caller.budgets.copyPrevious({ month: 5, year: 2025 });

      expect(result.copied).toBeGreaterThanOrEqual(1);
      expect(result.budgets).toBeInstanceOf(Array);
    });

    it('does not create duplicate budgets on re-copy', async () => {
      const caller = await callerFor(user);
      await caller.budgets.copyPrevious({ month: 5, year: 2025 });
      const budgets = await caller.budgets.list({ month: 5, year: 2025 });

      const catBudgets = budgets.budgets.filter((b) => b.categoryId === categoryId);
      expect(catBudgets.length).toBe(1);
    });
  });
});
