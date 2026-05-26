import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TRPCError } from '@trpc/server';
import { callerFor, publicCaller, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Dashboard procedures', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
    const caller = await callerFor(user);

    // Seed transactions sequentially
    await caller.transactions.create({
      amount: '3000',
      type: 'income',
      description: 'Salary',
      date: '2025-03-01',
      categoryName: 'Employment',
    });
    await caller.transactions.create({
      amount: '200',
      type: 'expense',
      description: 'Groceries',
      date: '2025-03-05',
      categoryName: 'Food',
      subcategoryName: 'Groceries',
    });
    await caller.transactions.create({
      amount: '80',
      type: 'expense',
      description: 'Gas',
      date: '2025-03-10',
      categoryName: 'Transport',
    });
    await caller.transactions.create({
      amount: '50',
      type: 'expense',
      description: 'Dining',
      date: '2025-03-15',
      categoryName: 'Food',
      subcategoryName: 'Dining',
    });
    await caller.transactions.create({
      amount: '1500',
      type: 'income',
      description: 'Feb income',
      date: '2025-02-15',
      categoryName: 'Employment',
    });
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  describe('dashboard.summary', () => {
    it('returns monthly summary with totals', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.summary({ month: 3, year: 2025 });

      expect(result.totalIncome).toBe(3000);
      expect(result.totalExpenses).toBe(330);
      expect(result.net).toBe(2670);
      expect(result.transactionCount).toBe(4);
    });

    it('returns zeros for month with no transactions', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.summary({ month: 12, year: 2024 });

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.net).toBe(0);
      expect(result.transactionCount).toBe(0);
    });

    it('rejects unauthenticated request', async () => {
      await expect(
        publicCaller().dashboard.summary({ month: 3, year: 2025 }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('dashboard.breakdown', () => {
    it('returns expense breakdown by category', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.breakdown({ month: 3, year: 2025 });

      expect(result.breakdown).toBeInstanceOf(Array);
      expect(result.breakdown.length).toBe(2); // Food, Transport

      const totals = result.breakdown.map((b) => b.total);
      expect(totals[0]).toBeGreaterThanOrEqual(totals[1]);

      const totalPct = result.breakdown.reduce((sum, b) => sum + b.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 0);
    });

    it('returns empty array for month with no expenses', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.breakdown({ month: 12, year: 2024 });
      expect(result.breakdown).toEqual([]);
    });
  });

  describe('dashboard.categoryBreakdown', () => {
    it('returns categories with subcategory detail', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.categoryBreakdown({ month: 3, year: 2025 });

      expect(result.categories).toBeInstanceOf(Array);
      const food = result.categories.find((c) => c.categoryName === 'Food');
      expect(food).toBeDefined();
      expect(food!.total).toBe(250); // 200 + 50
      expect(food!.subcategories.length).toBe(2);
    });
  });

  describe('dashboard.yearly', () => {
    it('returns 12 months of data', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.yearly({ year: 2025 });

      expect(result.months).toHaveLength(12);

      const march = result.months.find((m) => m.month === 3);
      expect(march!.income).toBe(3000);
      expect(march!.expenses).toBe(330);
      expect(march!.net).toBe(2670);

      const feb = result.months.find((m) => m.month === 2);
      expect(feb!.income).toBe(1500);
    });

    it('rejects unauthenticated request', async () => {
      await expect(publicCaller().dashboard.yearly({ year: 2025 })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('dashboard.trend', () => {
    it('returns trend data for requested months', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.trend({ months: 6 });

      expect(result.trend).toHaveLength(6);
      for (const point of result.trend) {
        expect(point.month).toBeDefined();
        expect(point.year).toBeDefined();
        expect(point.label).toBeDefined();
        expect(point.income).toBeDefined();
        expect(point.expenses).toBeDefined();
      }
    });

    it('defaults to 6 months', async () => {
      const caller = await callerFor(user);
      const result = await caller.dashboard.trend({});
      expect(result.trend).toHaveLength(6);
    });

    it('rejects out-of-range months', async () => {
      const caller = await callerFor(user);
      await expect(caller.dashboard.trend({ months: 25 })).rejects.toBeInstanceOf(TRPCError);
    });
  });
});
