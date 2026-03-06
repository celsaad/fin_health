import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Budget routes', () => {
  let user: TestUser;
  let categoryId: string;

  beforeAll(async () => {
    user = await createTestUser();
    // Create a transaction to get a category auto-resolved
    const txRes = await api()
      .post('/api/transactions')
      .set({ Authorization: `Bearer ${user.token}` })
      .send({
        amount: 100,
        type: 'expense',
        description: 'Budget test expense',
        date: '2025-03-15',
        categoryName: 'Groceries',
      });
    categoryId = txRes.body.transaction.category.id;
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  function auth() {
    return { Authorization: `Bearer ${user.token}` };
  }

  describe('POST /api/budgets', () => {
    it('creates a monthly budget without category (overall)', async () => {
      const res = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 2000, month: 3, year: 2025 });

      expect(res.status).toBe(201);
      expect(res.body.budget).toBeDefined();
      expect(res.body.budget.amount).toBe('2000');
      expect(res.body.budget.month).toBe(3);
      expect(res.body.budget.year).toBe(2025);
    });

    it('creates a category-specific budget', async () => {
      const res = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 500, month: 3, year: 2025, categoryId });

      expect(res.status).toBe(201);
      expect(res.body.budget.categoryId).toBe(categoryId);
    });

    it('creates a recurring budget', async () => {
      const res = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 1500, isRecurring: true, categoryId });

      expect(res.status).toBe(201);
      expect(res.body.budget.isRecurring).toBe(true);
      expect(res.body.budget.month).toBe(0);
      expect(res.body.budget.year).toBe(0);
    });

    it('upserts on duplicate month/year/category', async () => {
      // First create
      await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 300, month: 6, year: 2025, categoryId });

      // Same key, different amount
      const res = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 400, month: 6, year: 2025, categoryId });

      expect(res.status).toBe(201);
      expect(res.body.budget.amount).toBe('400');
    });

    it('rejects non-recurring budget without month/year', async () => {
      const res = await api().post('/api/budgets').set(auth()).send({ amount: 500 });

      expect(res.status).toBe(400);
    });

    it('rejects invalid categoryId', async () => {
      const res = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 500, month: 3, year: 2025, categoryId: 'nonexistent' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/budgets', () => {
    it('returns budgets with spent calculation', async () => {
      const res = await api().get('/api/budgets?month=3&year=2025').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.budgets).toBeInstanceOf(Array);
      expect(res.body.budgets.length).toBeGreaterThan(0);

      for (const budget of res.body.budgets) {
        expect(budget.spent).toBeDefined();
        expect(budget.remaining).toBeDefined();
      }
    });

    it('includes recurring budgets in results', async () => {
      // Query for a month that only has recurring budgets
      const res = await api().get('/api/budgets?month=1&year=2025').set(auth());

      expect(res.status).toBe(200);
      const recurring = res.body.budgets.filter((b: { isRecurring: boolean }) => b.isRecurring);
      expect(recurring.length).toBeGreaterThan(0);
    });

    it('rejects missing month/year', async () => {
      const res = await api().get('/api/budgets').set(auth());

      expect(res.status).toBe(400);
    });

    it('rejects invalid month', async () => {
      const res = await api().get('/api/budgets?month=13&year=2025').set(auth());

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('deletes a budget', async () => {
      const createRes = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 999, month: 12, year: 2025 });

      const budgetId = createRes.body.budget.id;

      const res = await api().delete(`/api/budgets/${budgetId}`).set(auth());

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Budget deleted');
    });

    it('returns 404 for non-existent budget', async () => {
      const res = await api().delete('/api/budgets/nonexistent-id').set(auth());

      expect(res.status).toBe(404);
    });

    it("cannot delete another user's budget", async () => {
      const other = await createTestUser();
      const createRes = await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 100, month: 11, year: 2025 });

      const budgetId = createRes.body.budget.id;

      const res = await api()
        .delete(`/api/budgets/${budgetId}`)
        .set({ Authorization: `Bearer ${other.token}` });

      expect(res.status).toBe(404);
      await cleanupUser(other.id);
    });
  });

  describe('POST /api/budgets/copy-previous', () => {
    it('copies budgets from previous month', async () => {
      // Create a non-recurring category-specific budget for month 4
      await api()
        .post('/api/budgets')
        .set(auth())
        .send({ amount: 800, month: 4, year: 2025, categoryId });

      // Copy to month 5
      const res = await api()
        .post('/api/budgets/copy-previous')
        .set(auth())
        .send({ month: 5, year: 2025 });

      expect(res.status).toBe(200);
      expect(res.body.copied).toBeGreaterThanOrEqual(1);
      expect(res.body.budgets).toBeInstanceOf(Array);
    });

    it('does not create duplicate budgets on re-copy', async () => {
      // Copy again to month 5 — upsert prevents duplicates
      const res = await api()
        .post('/api/budgets/copy-previous')
        .set(auth())
        .send({ month: 5, year: 2025 });

      expect(res.status).toBe(200);
      expect(res.body.budgets).toBeInstanceOf(Array);

      // Verify no duplicates in the target month
      const budgets = await api().get('/api/budgets?month=5&year=2025').set(auth());

      const catBudgets = budgets.body.budgets.filter(
        (b: { categoryId: string | null }) => b.categoryId === categoryId,
      );
      expect(catBudgets.length).toBe(1);
    });
  });
});
