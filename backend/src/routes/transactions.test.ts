import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Transaction routes', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  function auth() {
    return { Authorization: `Bearer ${user.token}` };
  }

  async function createTx(overrides: Record<string, unknown> = {}) {
    const defaults = {
      amount: 50,
      type: 'expense',
      description: 'Test transaction',
      date: '2025-03-15',
      categoryName: 'Food',
    };
    const res = await api()
      .post('/api/transactions')
      .set(auth())
      .send({ ...defaults, ...overrides });
    return res;
  }

  describe('POST /api/transactions', () => {
    it('creates a transaction with category auto-resolution', async () => {
      const res = await createTx({
        description: 'Groceries',
        categoryName: 'Food',
        subcategoryName: 'Groceries',
      });

      expect(res.status).toBe(201);
      expect(res.body.transaction).toBeDefined();
      expect(res.body.transaction.description).toBe('Groceries');
      expect(res.body.transaction.amount).toBe('50');
      expect(res.body.transaction.type).toBe('expense');
      expect(res.body.transaction.date).toBe('2025-03-15');
      expect(res.body.transaction.category.name).toBe('Food');
      expect(res.body.transaction.subcategory.name).toBe('Groceries');
    });

    it('creates an income transaction', async () => {
      const res = await createTx({
        amount: 3000,
        type: 'income',
        description: 'Salary',
        categoryName: 'Employment',
      });

      expect(res.status).toBe(201);
      expect(res.body.transaction.type).toBe('income');
      expect(res.body.transaction.amount).toBe('3000');
      expect(res.body.transaction.category.name).toBe('Employment');
      expect(res.body.transaction.category.type).toBe('income');
    });

    it('rejects missing required fields', async () => {
      const res = await api().post('/api/transactions').set(auth()).send({ amount: 10 });

      expect(res.status).toBe(400);
    });

    it('rejects negative amount', async () => {
      const res = await createTx({ amount: -10 });
      expect(res.status).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await api().post('/api/transactions').send({
        amount: 50,
        type: 'expense',
        description: 'Test',
        date: '2025-01-01',
        categoryName: 'Food',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    it('lists transactions with pagination', async () => {
      const res = await api().get('/api/transactions').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.transactions).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('filters by type', async () => {
      const res = await api().get('/api/transactions?type=income').set(auth());

      expect(res.status).toBe(200);
      for (const tx of res.body.transactions) {
        expect(tx.type).toBe('income');
      }
    });

    it('filters by date range', async () => {
      const res = await api()
        .get('/api/transactions?startDate=2025-03-01&endDate=2025-03-31')
        .set(auth());

      expect(res.status).toBe(200);
      for (const tx of res.body.transactions) {
        expect(tx.date >= '2025-03-01').toBe(true);
        expect(tx.date <= '2025-03-31').toBe(true);
      }
    });

    it('filters by search term', async () => {
      const res = await api().get('/api/transactions?search=Groceries').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBeGreaterThan(0);
      for (const tx of res.body.transactions) {
        expect(tx.description.toLowerCase()).toContain('groceries');
      }
    });

    it('paginates correctly', async () => {
      const res = await api().get('/api/transactions?page=1&limit=1').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination.limit).toBe(1);
    });

    it('rejects unauthenticated request', async () => {
      const res = await api().get('/api/transactions');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('returns a single transaction', async () => {
      // Create one first
      const created = await createTx({ description: 'Single fetch test' });
      const id = created.body.transaction.id;

      const res = await api().get(`/api/transactions/${id}`).set(auth());

      expect(res.status).toBe(200);
      expect(res.body.transaction.id).toBe(id);
      expect(res.body.transaction.description).toBe('Single fetch test');
    });

    it('returns 404 for non-existent id', async () => {
      const res = await api().get('/api/transactions/nonexistent-id').set(auth());

      expect(res.status).toBe(404);
    });

    it("cannot access another user's transaction", async () => {
      const other = await createTestUser();
      const created = await createTx({ description: 'Owner only' });
      const id = created.body.transaction.id;

      const res = await api()
        .get(`/api/transactions/${id}`)
        .set({ Authorization: `Bearer ${other.token}` });

      expect(res.status).toBe(404);
      await cleanupUser(other.id);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('updates transaction fields', async () => {
      const created = await createTx({ description: 'Before update', amount: 25 });
      const id = created.body.transaction.id;

      const res = await api()
        .put(`/api/transactions/${id}`)
        .set(auth())
        .send({ description: 'After update', amount: 99 });

      expect(res.status).toBe(200);
      expect(res.body.transaction.description).toBe('After update');
      expect(res.body.transaction.amount).toBe('99');
    });

    it('updates category via categoryName', async () => {
      const created = await createTx({ categoryName: 'Food' });
      const id = created.body.transaction.id;

      const res = await api()
        .put(`/api/transactions/${id}`)
        .set(auth())
        .send({ categoryName: 'Transport' });

      expect(res.status).toBe(200);
      expect(res.body.transaction.category.name).toBe('Transport');
    });

    it('returns 404 for non-existent transaction', async () => {
      const res = await api()
        .put('/api/transactions/nonexistent-id')
        .set(auth())
        .send({ description: 'nope' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('soft-deletes a transaction', async () => {
      const created = await createTx({ description: 'To be deleted' });
      const id = created.body.transaction.id;

      const delRes = await api().delete(`/api/transactions/${id}`).set(auth());

      expect(delRes.status).toBe(200);
      expect(delRes.body.message).toBe('Transaction deleted');

      // Verify it's gone from normal listing
      const getRes = await api().get(`/api/transactions/${id}`).set(auth());

      expect(getRes.status).toBe(404);
    });

    it('returns 404 when deleting already-deleted transaction', async () => {
      const created = await createTx({ description: 'Double delete' });
      const id = created.body.transaction.id;

      await api().delete(`/api/transactions/${id}`).set(auth());

      const res = await api().delete(`/api/transactions/${id}`).set(auth());

      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent id', async () => {
      const res = await api().delete('/api/transactions/nonexistent-id').set(auth());

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/transactions/bulk-delete', () => {
    it('soft-deletes multiple transactions', async () => {
      const [r1, r2] = await Promise.all([
        createTx({ description: 'Bulk 1' }),
        createTx({ description: 'Bulk 2' }),
      ]);

      const ids = [r1.body.transaction.id, r2.body.transaction.id];

      const res = await api().post('/api/transactions/bulk-delete').set(auth()).send({ ids });

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(2);

      // Verify they're gone
      for (const id of ids) {
        const getRes = await api().get(`/api/transactions/${id}`).set(auth());
        expect(getRes.status).toBe(404);
      }
    });

    it('ignores ids belonging to other users', async () => {
      const other = await createTestUser();
      const otherRes = await api()
        .post('/api/transactions')
        .set({ Authorization: `Bearer ${other.token}` })
        .send({
          amount: 10,
          type: 'expense',
          description: 'Other user tx',
          date: '2025-01-01',
          categoryName: 'Misc',
        });

      const res = await api()
        .post('/api/transactions/bulk-delete')
        .set(auth())
        .send({ ids: [otherRes.body.transaction.id] });

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(0);

      await cleanupUser(other.id);
    });

    it('rejects empty ids array', async () => {
      const res = await api().post('/api/transactions/bulk-delete').set(auth()).send({ ids: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/transactions/export/csv', () => {
    it('exports transactions as CSV', async () => {
      const res = await api().get('/api/transactions/export/csv').set(auth());

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('transactions.csv');

      const lines = res.text.trim().split('\n');
      // Header + at least one data row
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines[0]).toContain('Date');
      expect(lines[0]).toContain('Amount');
      expect(lines[0]).toContain('Category');
    });

    it('filters CSV export by type', async () => {
      const res = await api().get('/api/transactions/export/csv?type=income').set(auth());

      expect(res.status).toBe(200);
      const lines = res.text.trim().split('\n');
      // All data rows should be income
      for (let i = 1; i < lines.length; i++) {
        expect(lines[i]).toContain('income');
      }
    });
  });
});
