import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { callerFor, createTestUser, cleanupUser, TestUser } from '../test/helpers';
import { generateRecurringTransactions } from './recurringGenerator';
import { __testing } from './exchangeRate';
import prisma from '../lib/prisma';

describe('generateRecurringTransactions', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupUser(user.id);
  });

  afterEach(() => {
    __testing.clearCache();
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

  it('generates a USD transaction with amountUsd equal to amount and exchangeRate 1', async () => {
    const created = await createRecurring({
      description: 'USD generator test',
      amount: '50',
      startDate: '2025-01-01',
    });

    const count = await generateRecurringTransactions(user.id);
    expect(count).toBeGreaterThan(0);

    const generated = await prisma.transaction.findMany({
      where: { recurringTransactionId: created.recurringTransaction.id },
    });

    expect(generated.length).toBeGreaterThan(0);
    for (const tx of generated) {
      expect(Number(tx.amount)).toBe(50);
      expect(Number(tx.amountUsd)).toBe(50);
      expect(Number(tx.exchangeRate)).toBe(1);
      expect(tx.currency).toBe('USD');
    }
  });

  it('generates a non-USD transaction converted to USD using the template currency', async () => {
    // Seed the exchange rate cache so toUsd doesn't hit the network.
    // Cache key format: `CCY-YYYY-MM-DD-slot`
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const slot = now.getUTCHours() >= 16 ? '16' : '00';
    __testing.setCacheEntry(`BRL-${date}-${slot}`, 5);

    const created = await createRecurring({
      description: 'BRL generator test',
      amount: '100',
      currency: 'brl',
      startDate: '2025-01-01',
    });

    await generateRecurringTransactions(user.id);

    const generated = await prisma.transaction.findMany({
      where: { recurringTransactionId: created.recurringTransaction.id },
    });

    expect(generated.length).toBeGreaterThan(0);
    for (const tx of generated) {
      expect(tx.currency).toBe('BRL');
      expect(Number(tx.amount)).toBe(100);
      expect(Number(tx.exchangeRate)).toBe(5);
      expect(Number(tx.amountUsd)).toBeCloseTo(20, 5); // 100 / 5
    }
  });

  it('skips a template and does not update lastGenerated when the exchange rate lookup fails', async () => {
    const failingCurrency = 'ZZZ';
    const created = await createRecurring({
      description: 'Failing currency generator test',
      amount: '100',
      currency: failingCurrency,
      startDate: '2025-01-01',
    });

    // No cache entry seeded and fetch is unavailable/will fail in test env,
    // so toUsd should throw for this unknown currency.
    const originalFetch = global.fetch;
    global.fetch = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    try {
      await generateRecurringTransactions(user.id);
    } finally {
      global.fetch = originalFetch;
    }

    const generated = await prisma.transaction.findMany({
      where: { recurringTransactionId: created.recurringTransaction.id },
    });
    expect(generated.length).toBe(0);

    const template = await prisma.recurringTransaction.findUnique({
      where: { id: created.recurringTransaction.id },
    });
    expect(template?.lastGenerated).toBeNull();
  });
});
