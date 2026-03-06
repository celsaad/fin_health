import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, changePasswordSchema } from '../validators/auth';
import { createTransactionSchema, updateTransactionSchema, bulkDeleteSchema } from '../validators/transaction';
import { upsertBudgetSchema, copyBudgetsSchema } from '../validators/budget';
import { createRecurringSchema } from '../validators/recurring';
import {
  updateCategorySchema,
  mergeCategorySchema,
  createSubcategorySchema,
} from '../validators/category';

// ──────────────────────────────────────────
// Auth validators
// ──────────────────────────────────────────

describe('signupSchema', () => {
  const valid = { email: 'a@b.com', password: '123456', name: 'Alice' };

  it('accepts valid input', () => {
    expect(signupSchema.parse(valid)).toEqual(valid);
  });

  it('rejects invalid email', () => {
    expect(() => signupSchema.parse({ ...valid, email: 'bad' })).toThrow();
  });

  it('rejects short password', () => {
    expect(() => signupSchema.parse({ ...valid, password: '12345' })).toThrow();
  });

  it('rejects empty name', () => {
    expect(() => signupSchema.parse({ ...valid, name: '' })).toThrow();
  });

  it('rejects name over 100 chars', () => {
    expect(() => signupSchema.parse({ ...valid, name: 'x'.repeat(101) })).toThrow();
  });
});

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(loginSchema.parse({ email: 'a@b.com', password: 'p' })).toBeDefined();
  });

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow();
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid input', () => {
    expect(
      changePasswordSchema.parse({ currentPassword: 'old', newPassword: '123456' }),
    ).toBeDefined();
  });

  it('rejects short new password', () => {
    expect(() =>
      changePasswordSchema.parse({ currentPassword: 'old', newPassword: '12345' }),
    ).toThrow();
  });
});

// ──────────────────────────────────────────
// Transaction validators
// ──────────────────────────────────────────

describe('createTransactionSchema', () => {
  const valid = {
    amount: '50.00',
    type: 'expense' as const,
    description: 'Groceries',
    date: '2024-06-15',
    categoryName: 'Food',
  };

  it('accepts valid input', () => {
    const result = createTransactionSchema.parse(valid);
    expect(result.amount).toBe('50.00');
  });

  it('accepts numeric amount and transforms to string', () => {
    const result = createTransactionSchema.parse({ ...valid, amount: 42 });
    expect(result.amount).toBe('42');
  });

  it('rejects zero amount', () => {
    expect(() => createTransactionSchema.parse({ ...valid, amount: '0' })).toThrow();
  });

  it('rejects negative amount', () => {
    expect(() => createTransactionSchema.parse({ ...valid, amount: '-5' })).toThrow();
  });

  it('rejects non-numeric amount string', () => {
    expect(() => createTransactionSchema.parse({ ...valid, amount: 'abc' })).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() => createTransactionSchema.parse({ ...valid, type: 'transfer' })).toThrow();
  });

  it('rejects empty description', () => {
    expect(() => createTransactionSchema.parse({ ...valid, description: '' })).toThrow();
  });

  it('rejects description over 255 chars', () => {
    expect(() =>
      createTransactionSchema.parse({ ...valid, description: 'x'.repeat(256) }),
    ).toThrow();
  });

  it('rejects invalid date', () => {
    expect(() => createTransactionSchema.parse({ ...valid, date: 'not-a-date' })).toThrow();
  });

  it('rejects empty categoryName', () => {
    expect(() => createTransactionSchema.parse({ ...valid, categoryName: '' })).toThrow();
  });

  it('accepts optional fields', () => {
    const result = createTransactionSchema.parse({
      ...valid,
      subcategoryName: 'Produce',
      notes: 'Weekly shop',
    });
    expect(result.subcategoryName).toBe('Produce');
    expect(result.notes).toBe('Weekly shop');
  });

  it('rejects notes over 1000 chars', () => {
    expect(() =>
      createTransactionSchema.parse({ ...valid, notes: 'x'.repeat(1001) }),
    ).toThrow();
  });
});

describe('updateTransactionSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateTransactionSchema.parse({})).toBeDefined();
  });

  it('accepts partial update', () => {
    const result = updateTransactionSchema.parse({ amount: '100' });
    expect(result.amount).toBe('100');
  });

  it('allows nullable subcategoryName and notes', () => {
    const result = updateTransactionSchema.parse({
      subcategoryName: null,
      notes: null,
    });
    expect(result.subcategoryName).toBeNull();
    expect(result.notes).toBeNull();
  });
});

describe('bulkDeleteSchema', () => {
  it('accepts 1-200 ids', () => {
    expect(bulkDeleteSchema.parse({ ids: ['a'] })).toBeDefined();
  });

  it('rejects empty array', () => {
    expect(() => bulkDeleteSchema.parse({ ids: [] })).toThrow();
  });

  it('rejects over 200 ids', () => {
    const ids = Array.from({ length: 201 }, (_, i) => String(i));
    expect(() => bulkDeleteSchema.parse({ ids })).toThrow();
  });
});

// ──────────────────────────────────────────
// Budget validators
// ──────────────────────────────────────────

describe('upsertBudgetSchema', () => {
  it('accepts non-recurring with month and year', () => {
    const result = upsertBudgetSchema.parse({
      amount: '500',
      month: 6,
      year: 2024,
    });
    expect(result.amount).toBe('500');
  });

  it('accepts numeric amount', () => {
    const result = upsertBudgetSchema.parse({ amount: 100, month: 1, year: 2024 });
    expect(result.amount).toBe('100');
  });

  it('rejects non-recurring without month', () => {
    expect(() => upsertBudgetSchema.parse({ amount: '500', year: 2024 })).toThrow();
  });

  it('rejects non-recurring without year', () => {
    expect(() => upsertBudgetSchema.parse({ amount: '500', month: 6 })).toThrow();
  });

  it('accepts recurring without month/year', () => {
    const result = upsertBudgetSchema.parse({
      amount: '500',
      isRecurring: true,
    });
    expect(result.isRecurring).toBe(true);
  });

  it('rejects month out of range', () => {
    expect(() => upsertBudgetSchema.parse({ amount: '100', month: 0, year: 2024 })).toThrow();
    expect(() => upsertBudgetSchema.parse({ amount: '100', month: 13, year: 2024 })).toThrow();
  });

  it('rejects year out of range', () => {
    expect(() => upsertBudgetSchema.parse({ amount: '100', month: 1, year: 1999 })).toThrow();
    expect(() => upsertBudgetSchema.parse({ amount: '100', month: 1, year: 2101 })).toThrow();
  });

  it('allows nullable categoryId', () => {
    const result = upsertBudgetSchema.parse({
      amount: '500',
      month: 1,
      year: 2024,
      categoryId: null,
    });
    expect(result.categoryId).toBeNull();
  });
});

describe('copyBudgetsSchema', () => {
  it('accepts valid month and year', () => {
    expect(copyBudgetsSchema.parse({ month: 3, year: 2025 })).toBeDefined();
  });

  it('rejects invalid month', () => {
    expect(() => copyBudgetsSchema.parse({ month: 0, year: 2025 })).toThrow();
  });
});

// ──────────────────────────────────────────
// Recurring validators
// ──────────────────────────────────────────

describe('createRecurringSchema', () => {
  const valid = {
    amount: '100',
    type: 'expense' as const,
    description: 'Netflix',
    frequency: 'monthly' as const,
    startDate: '2024-01-01',
    categoryName: 'Entertainment',
  };

  it('accepts valid input', () => {
    expect(createRecurringSchema.parse(valid)).toBeDefined();
  });

  it('accepts all frequency values', () => {
    for (const freq of ['weekly', 'biweekly', 'monthly', 'yearly'] as const) {
      expect(createRecurringSchema.parse({ ...valid, frequency: freq })).toBeDefined();
    }
  });

  it('rejects invalid frequency', () => {
    expect(() => createRecurringSchema.parse({ ...valid, frequency: 'daily' })).toThrow();
  });

  it('rejects invalid startDate', () => {
    expect(() => createRecurringSchema.parse({ ...valid, startDate: 'nope' })).toThrow();
  });

  it('accepts optional endDate', () => {
    const result = createRecurringSchema.parse({ ...valid, endDate: '2025-12-31' });
    expect(result.endDate).toBe('2025-12-31');
  });

  it('accepts null endDate', () => {
    const result = createRecurringSchema.parse({ ...valid, endDate: null });
    expect(result.endDate).toBeNull();
  });

  it('rejects zero amount', () => {
    expect(() => createRecurringSchema.parse({ ...valid, amount: '0' })).toThrow();
  });
});

// ──────────────────────────────────────────
// Category validators
// ──────────────────────────────────────────

describe('updateCategorySchema', () => {
  it('accepts empty object', () => {
    expect(updateCategorySchema.parse({})).toBeDefined();
  });

  it('accepts partial fields', () => {
    const result = updateCategorySchema.parse({ name: 'Food', icon: 'utensils' });
    expect(result.name).toBe('Food');
    expect(result.icon).toBe('utensils');
  });

  it('rejects empty name', () => {
    expect(() => updateCategorySchema.parse({ name: '' })).toThrow();
  });

  it('rejects icon over 50 chars', () => {
    expect(() => updateCategorySchema.parse({ icon: 'x'.repeat(51) })).toThrow();
  });
});

describe('mergeCategorySchema', () => {
  it('requires targetCategoryId', () => {
    expect(() => mergeCategorySchema.parse({})).toThrow();
  });

  it('rejects empty targetCategoryId', () => {
    expect(() => mergeCategorySchema.parse({ targetCategoryId: '' })).toThrow();
  });

  it('accepts valid id', () => {
    expect(mergeCategorySchema.parse({ targetCategoryId: 'abc123' })).toBeDefined();
  });
});

describe('createSubcategorySchema', () => {
  it('accepts valid name', () => {
    expect(createSubcategorySchema.parse({ name: 'Produce' })).toBeDefined();
  });

  it('rejects empty name', () => {
    expect(() => createSubcategorySchema.parse({ name: '' })).toThrow();
  });

  it('rejects name over 100 chars', () => {
    expect(() => createSubcategorySchema.parse({ name: 'x'.repeat(101) })).toThrow();
  });
});
