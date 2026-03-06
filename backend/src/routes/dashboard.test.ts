import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Dashboard routes', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();

    const auth = { Authorization: `Bearer ${user.token}` };

    // Seed transactions sequentially (shared categories cause race conditions in parallel)
    await api().post('/api/transactions').set(auth).send({
      amount: 3000, type: 'income', description: 'Salary',
      date: '2025-03-01', categoryName: 'Employment',
    });
    await api().post('/api/transactions').set(auth).send({
      amount: 200, type: 'expense', description: 'Groceries',
      date: '2025-03-05', categoryName: 'Food', subcategoryName: 'Groceries',
    });
    await api().post('/api/transactions').set(auth).send({
      amount: 80, type: 'expense', description: 'Gas',
      date: '2025-03-10', categoryName: 'Transport',
    });
    await api().post('/api/transactions').set(auth).send({
      amount: 50, type: 'expense', description: 'Dining',
      date: '2025-03-15', categoryName: 'Food', subcategoryName: 'Dining',
    });
    // Feb 2025 for trend tests
    await api().post('/api/transactions').set(auth).send({
      amount: 1500, type: 'income', description: 'Feb income',
      date: '2025-02-15', categoryName: 'Employment',
    });
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  function auth() {
    return { Authorization: `Bearer ${user.token}` };
  }

  describe('GET /api/dashboard/summary', () => {
    it('returns monthly summary with totals', async () => {
      const res = await api()
        .get('/api/dashboard/summary?month=3&year=2025')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.totalIncome).toBe('3000');
      expect(res.body.totalExpenses).toBe('330');
      expect(res.body.net).toBe('2670');
      expect(res.body.transactionCount).toBe(4);
    });

    it('returns zeros for month with no transactions', async () => {
      const res = await api()
        .get('/api/dashboard/summary?month=12&year=2024')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.totalIncome).toBe('0');
      expect(res.body.totalExpenses).toBe('0');
      expect(res.body.net).toBe('0');
      expect(res.body.transactionCount).toBe(0);
    });

    it('rejects missing params', async () => {
      const res = await api()
        .get('/api/dashboard/summary')
        .set(auth());
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/dashboard/breakdown', () => {
    it('returns expense breakdown by category', async () => {
      const res = await api()
        .get('/api/dashboard/breakdown?month=3&year=2025')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.breakdown).toBeInstanceOf(Array);
      expect(res.body.breakdown.length).toBe(2); // Food, Transport

      // Should be sorted by total descending
      const totals = res.body.breakdown.map((b: { total: number }) => b.total);
      expect(totals[0]).toBeGreaterThanOrEqual(totals[1]);

      // Percentages should add up to ~100
      const totalPct = res.body.breakdown.reduce(
        (sum: number, b: { percentage: number }) => sum + b.percentage, 0
      );
      expect(totalPct).toBeCloseTo(100, 0);
    });

    it('returns empty array for month with no expenses', async () => {
      const res = await api()
        .get('/api/dashboard/breakdown?month=12&year=2024')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.breakdown).toEqual([]);
    });
  });

  describe('GET /api/dashboard/category-breakdown', () => {
    it('returns categories with subcategory detail', async () => {
      const res = await api()
        .get('/api/dashboard/category-breakdown?month=3&year=2025')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.categories).toBeInstanceOf(Array);

      // Food should have subcategories
      const food = res.body.categories.find(
        (c: { categoryName: string }) => c.categoryName === 'Food'
      );
      expect(food).toBeDefined();
      expect(food.total).toBe(250); // 200 + 50
      expect(food.subcategories.length).toBe(2);
    });
  });

  describe('GET /api/dashboard/yearly', () => {
    it('returns 12 months of data', async () => {
      const res = await api()
        .get('/api/dashboard/yearly?year=2025')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.months).toHaveLength(12);

      // Check March has our data
      const march = res.body.months.find((m: { month: number }) => m.month === 3);
      expect(march.income).toBe('3000');
      expect(march.expenses).toBe('330');
      expect(march.net).toBe('2670');

      // Feb should have income
      const feb = res.body.months.find((m: { month: number }) => m.month === 2);
      expect(feb.income).toBe('1500');
    });

    it('rejects missing year', async () => {
      const res = await api()
        .get('/api/dashboard/yearly')
        .set(auth());
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/dashboard/trend', () => {
    it('returns trend data for requested months', async () => {
      const res = await api()
        .get('/api/dashboard/trend?months=6')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.trend).toHaveLength(6);

      for (const point of res.body.trend) {
        expect(point.month).toBeDefined();
        expect(point.year).toBeDefined();
        expect(point.label).toBeDefined();
        expect(point.income).toBeDefined();
        expect(point.expenses).toBeDefined();
      }
    });

    it('defaults to 6 months when not specified', async () => {
      const res = await api()
        .get('/api/dashboard/trend')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.trend).toHaveLength(6);
    });

    it('rejects out-of-range months', async () => {
      const res = await api()
        .get('/api/dashboard/trend?months=25')
        .set(auth());
      expect(res.status).toBe(400);
    });
  });
});
