import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TRPCError } from '@trpc/server';
import { api, callerFor, publicCaller, createTestUser, cleanupUser, TestUser } from '../test/helpers';

describe('Transaction procedures', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  async function createTx(overrides: Record<string, unknown> = {}) {
    const caller = await callerFor(user);
    return caller.transactions.create({
      amount: '50',
      type: 'expense',
      description: 'Test transaction',
      date: '2025-03-15',
      categoryName: 'Food',
      ...overrides,
    } as Parameters<typeof caller.transactions.create>[0]);
  }

  describe('transactions.create', () => {
    it('creates a transaction with category auto-resolution', async () => {
      const result = await createTx({ description: 'Groceries', categoryName: 'Food', subcategoryName: 'Groceries' });

      expect(result.transaction.description).toBe('Groceries');
      expect(result.transaction.amount).toBe(50);
      expect(result.transaction.type).toBe('expense');
      expect(result.transaction.date).toBe('2025-03-15');
      expect(result.transaction.category.name).toBe('Food');
      expect(result.transaction.subcategory?.name).toBe('Groceries');
    });

    it('creates an income transaction', async () => {
      const result = await createTx({ amount: '3000', type: 'income', description: 'Salary', categoryName: 'Employment' });

      expect(result.transaction.type).toBe('income');
      expect(result.transaction.amount).toBe(3000);
      expect(result.transaction.category.name).toBe('Employment');
      expect(result.transaction.category.type).toBe('income');
    });

    it('rejects missing required fields', async () => {
      const caller = await callerFor(user);
      await expect(
        caller.transactions.create({ amount: '10' } as never),
      ).rejects.toBeInstanceOf(TRPCError);
    });

    it('rejects negative amount', async () => {
      await expect(createTx({ amount: '-10' })).rejects.toBeInstanceOf(TRPCError);
    });

    it('rejects unauthenticated request', async () => {
      const caller = publicCaller();
      await expect(
        caller.transactions.create({ amount: '50', type: 'expense', description: 'Test', date: '2025-01-01', categoryName: 'Food' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('transactions.list', () => {
    it('lists transactions with pagination', async () => {
      const caller = await callerFor(user);
      const result = await caller.transactions.list({ page: 1, limit: 20 });

      expect(result.transactions).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('filters by type', async () => {
      const caller = await callerFor(user);
      const result = await caller.transactions.list({ type: 'income' });

      for (const tx of result.transactions) {
        expect(tx.type).toBe('income');
      }
    });

    it('filters by date range', async () => {
      const caller = await callerFor(user);
      const result = await caller.transactions.list({ startDate: '2025-03-01', endDate: '2025-03-31' });

      for (const tx of result.transactions) {
        expect(tx.date >= '2025-03-01').toBe(true);
        expect(tx.date <= '2025-03-31').toBe(true);
      }
    });

    it('filters by search term', async () => {
      const caller = await callerFor(user);
      const result = await caller.transactions.list({ search: 'Groceries' });

      expect(result.transactions.length).toBeGreaterThan(0);
      for (const tx of result.transactions) {
        expect(tx.description.toLowerCase()).toContain('groceries');
      }
    });

    it('paginates correctly', async () => {
      const caller = await callerFor(user);
      const result = await caller.transactions.list({ page: 1, limit: 1 });

      expect(result.transactions.length).toBeLessThanOrEqual(1);
      expect(result.pagination.limit).toBe(1);
    });

    it('rejects unauthenticated request', async () => {
      await expect(publicCaller().transactions.list({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('transactions.byId', () => {
    it('returns a single transaction', async () => {
      const created = await createTx({ description: 'Single fetch test' });
      const id = created.transaction.id;
      const caller = await callerFor(user);

      const result = await caller.transactions.byId({ id });

      expect(result.transaction.id).toBe(id);
      expect(result.transaction.description).toBe('Single fetch test');
    });

    it('returns NOT_FOUND for non-existent id', async () => {
      const caller = await callerFor(user);
      await expect(caller.transactions.byId({ id: 'nonexistent-id' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it("cannot access another user's transaction", async () => {
      const other = await createTestUser();
      const created = await createTx({ description: 'Owner only' });
      const id = created.transaction.id;
      const otherCaller = await callerFor(other);

      await expect(otherCaller.transactions.byId({ id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
      await cleanupUser(other.id);
    });
  });

  describe('transactions.update', () => {
    it('updates transaction fields', async () => {
      const created = await createTx({ description: 'Before update', amount: '25' });
      const id = created.transaction.id;
      const caller = await callerFor(user);

      const result = await caller.transactions.update({ id, description: 'After update', amount: '99' });

      expect(result.transaction.description).toBe('After update');
      expect(result.transaction.amount).toBe(99);
    });

    it('updates category via categoryName', async () => {
      const created = await createTx({ categoryName: 'Food' });
      const id = created.transaction.id;
      const caller = await callerFor(user);

      const result = await caller.transactions.update({ id, categoryName: 'Transport' });

      expect(result.transaction.category.name).toBe('Transport');
    });

    it('returns NOT_FOUND for non-existent transaction', async () => {
      const caller = await callerFor(user);
      await expect(
        caller.transactions.update({ id: 'nonexistent-id', description: 'nope' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('transactions.delete', () => {
    it('soft-deletes a transaction', async () => {
      const created = await createTx({ description: 'To be deleted' });
      const id = created.transaction.id;
      const caller = await callerFor(user);

      const delResult = await caller.transactions.delete({ id });
      expect(delResult.message).toBe('Transaction deleted');

      // Verify it's gone from normal listing
      await expect(caller.transactions.byId({ id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('returns NOT_FOUND for already-deleted transaction', async () => {
      const created = await createTx({ description: 'Double delete' });
      const id = created.transaction.id;
      const caller = await callerFor(user);

      await caller.transactions.delete({ id });
      await expect(caller.transactions.delete({ id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('transactions.bulkDelete', () => {
    it('soft-deletes multiple transactions', async () => {
      const [r1, r2] = await Promise.all([
        createTx({ description: 'Bulk 1' }),
        createTx({ description: 'Bulk 2' }),
      ]);
      const ids = [r1.transaction.id, r2.transaction.id];
      const caller = await callerFor(user);

      const result = await caller.transactions.bulkDelete({ ids });
      expect(result.deleted).toBe(2);

      for (const id of ids) {
        await expect(caller.transactions.byId({ id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
      }
    });

    it('ignores ids belonging to other users', async () => {
      const other = await createTestUser();
      const otherCaller = await callerFor(other);
      const created = await otherCaller.transactions.create({
        amount: '10', type: 'expense', description: 'Other user tx', date: '2025-01-01', categoryName: 'Misc',
      });

      const caller = await callerFor(user);
      const result = await caller.transactions.bulkDelete({ ids: [created.transaction.id] });

      expect(result.deleted).toBe(0);
      await cleanupUser(other.id);
    });

    it('rejects empty ids array', async () => {
      const caller = await callerFor(user);
      await expect(caller.transactions.bulkDelete({ ids: [] })).rejects.toBeInstanceOf(TRPCError);
    });
  });

  // CSV export stays as a plain Express route
  describe('GET /api/transactions/export/csv', () => {
    it('exports transactions as CSV', async () => {
      const res = await api().get('/api/transactions/export/csv').set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('transactions.csv');

      const lines = res.text.trim().split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines[0]).toContain('Date');
      expect(lines[0]).toContain('Amount');
      expect(lines[0]).toContain('Category');
    });

    it('filters CSV export by type', async () => {
      const res = await api()
        .get('/api/transactions/export/csv?type=income')
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      const lines = res.text.trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        expect(lines[i]).toContain('income');
      }
    });
  });
});
