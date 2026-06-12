import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { createTestUser, callerFor, cleanupUser, type TestUser } from '../test/helpers';
import prisma from '../lib/prisma';
import { env } from '../lib/env';

const { envOverrides, mockScan } = vi.hoisted(() => ({
  envOverrides: {
    FEATURE_RECEIPT_SCANNING: true,
    RECEIPT_PROVIDER: 'anthropic' as const,
    ANTHROPIC_API_KEY: 'test-key',
    OPENAI_API_KEY: '',
    DASHSCOPE_API_KEY: '',
  },
  mockScan: vi.fn(),
}));

vi.mock('../lib/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/env')>();
  return { env: Object.assign(actual.env, envOverrides) };
});

vi.mock('../services/receiptScanner', () => ({
  getReceiptProvider: vi.fn().mockImplementation(() => {
    if (!envOverrides.ANTHROPIC_API_KEY) {
      return Promise.reject(
        new Error('ANTHROPIC_API_KEY is required for the anthropic receipt provider'),
      );
    }
    return Promise.resolve({ scan: mockScan });
  }),
  RECEIPT_PROMPT: 'test prompt',
}));

const VALID_INPUT = {
  imageBase64: 'dGVzdA==',
  mimeType: 'image/jpeg' as const,
};

const SCAN_RESULT = {
  merchant: 'Test Store',
  amount: '42.50',
  currency: 'USD',
  date: '2026-06-09',
  type: 'expense' as const,
  description: 'Grocery shopping',
  categoryName: 'Food & Dining',
  confidence: 'high' as const,
};

async function createProUser(): Promise<TestUser> {
  const user = await createTestUser();
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'pro',
      status: 'active',
      stripeCustomerId: `cus_test_${user.id}`,
      stripeSubscriptionId: `sub_test_${user.id}`,
      cancelAtPeriodEnd: false,
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return user;
}

describe('receipts.scan', () => {
  let freeUser: TestUser;
  let proUser: TestUser;

  beforeAll(async () => {
    freeUser = await createTestUser();
    proUser = await createProUser();
  });

  afterAll(async () => {
    await cleanupUser(freeUser.id);
    await cleanupUser(proUser.id);
  });

  beforeEach(() => {
    (env as any).FEATURE_RECEIPT_SCANNING = true;
    (env as any).ANTHROPIC_API_KEY = 'test-key';
    envOverrides.ANTHROPIC_API_KEY = 'test-key';
    mockScan.mockReset();
  });

  it('throws FORBIDDEN when feature flag is off', async () => {
    (env as any).FEATURE_RECEIPT_SCANNING = false;
    const caller = await callerFor(proUser);

    await expect(caller.receipts.scan(VALID_INPUT)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'RECEIPT_SCANNING_DISABLED',
    });
  });

  it('throws FORBIDDEN for unauthenticated request', async () => {
    const { publicCaller } = await import('../test/helpers.js');
    const caller = publicCaller();

    await expect(caller.receipts.scan(VALID_INPUT)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('throws FORBIDDEN for free user (Pro required)', async () => {
    const caller = await callerFor(freeUser);

    await expect(caller.receipts.scan(VALID_INPUT)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'PRO_REQUIRED',
    });
  });

  it('throws INTERNAL_SERVER_ERROR when no API key is configured', async () => {
    (env as any).ANTHROPIC_API_KEY = '';
    envOverrides.ANTHROPIC_API_KEY = '';
    const caller = await callerFor(proUser);

    await expect(caller.receipts.scan(VALID_INPUT)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Receipt scanning is not configured',
    });
  });

  it('throws INTERNAL_SERVER_ERROR when the provider fails', async () => {
    mockScan.mockRejectedValueOnce(new Error('Provider API timeout'));
    const caller = await callerFor(proUser);

    await expect(caller.receipts.scan(VALID_INPUT)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to parse receipt. Please try a clearer image.',
    });
  });

  it('returns scan result for Pro user with valid image', async () => {
    mockScan.mockResolvedValueOnce(SCAN_RESULT);
    const caller = await callerFor(proUser);

    const { result } = await caller.receipts.scan(VALID_INPUT);

    expect(result.merchant).toBe('Test Store');
    expect(result.amount).toBe('42.50');
    expect(result.currency).toBe('USD');
    expect(result.type).toBe('expense');
    expect(result.confidence).toBe('high');
  });
});
