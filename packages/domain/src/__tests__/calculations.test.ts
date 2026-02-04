import { describe, it, expect } from 'vitest';
import { calculateMonthBudgetOverview } from '../calculations/budget';
import type {
  BudgetAllocation,
  Expense,
  Category,
  Subcategory,
} from '../types/index';

describe('budget calculations', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat1',
      userId: 'user1',
      name: 'Groceries',
      sortOrder: 0,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat2',
      userId: 'user1',
      name: 'Transportation',
      sortOrder: 1,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSubcategories: Subcategory[] = [
    {
      id: 'sub1',
      userId: 'user1',
      categoryId: 'cat1',
      name: 'Supermarket',
      sortOrder: 0,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sub2',
      userId: 'user1',
      categoryId: 'cat1',
      name: 'Restaurants',
      sortOrder: 1,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('calculateMonthBudgetOverview', () => {
    it('should calculate overview with allocations and expenses', () => {
      const allocations: BudgetAllocation[] = [
        {
          id: 'alloc1',
          budgetId: 'budget1',
          categoryId: 'cat1',
          subcategoryId: 'sub1',
          amountCents: 50000, // $500
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'alloc2',
          budgetId: 'budget1',
          categoryId: 'cat2',
          subcategoryId: null,
          amountCents: 30000, // $300
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expenses: Expense[] = [
        {
          id: 'exp1',
          userId: 'user1',
          occurredAt: new Date(),
          amountCents: 20000, // $200
          categoryId: 'cat1',
          subcategoryId: 'sub1',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'exp2',
          userId: 'user1',
          occurredAt: new Date(),
          amountCents: 10000, // $100
          categoryId: 'cat2',
          subcategoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations,
        expenses,
        categories: mockCategories,
        subcategories: mockSubcategories,
      });

      expect(overview.monthKey).toBe('2026-01');
      expect(overview.budgetId).toBe('budget1');
      expect(overview.totalAllocatedCents).toBe(80000); // $800
      expect(overview.totalSpentCents).toBe(30000); // $300
      expect(overview.totalRemainingCents).toBe(50000); // $500
      expect(overview.percentageSpent).toBe(37.5);

      expect(overview.categories).toHaveLength(2);

      // Check Groceries category
      const groceries = overview.categories.find((c) => c.categoryId === 'cat1');
      expect(groceries).toBeDefined();
      expect(groceries!.allocatedCents).toBe(50000);
      expect(groceries!.spentCents).toBe(20000);
      expect(groceries!.remainingCents).toBe(30000);
      expect(groceries!.percentageSpent).toBe(40);

      // Check Transportation category
      const transport = overview.categories.find((c) => c.categoryId === 'cat2');
      expect(transport).toBeDefined();
      expect(transport!.allocatedCents).toBe(30000);
      expect(transport!.spentCents).toBe(10000);
      expect(transport!.remainingCents).toBe(20000);
    });

    it('should handle overspending', () => {
      const allocations: BudgetAllocation[] = [
        {
          id: 'alloc1',
          budgetId: 'budget1',
          categoryId: 'cat1',
          subcategoryId: null,
          amountCents: 10000, // $100 allocated
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expenses: Expense[] = [
        {
          id: 'exp1',
          userId: 'user1',
          occurredAt: new Date(),
          amountCents: 15000, // $150 spent
          categoryId: 'cat1',
          subcategoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations,
        expenses,
        categories: mockCategories,
        subcategories: mockSubcategories,
      });

      expect(overview.totalAllocatedCents).toBe(10000);
      expect(overview.totalSpentCents).toBe(15000);
      expect(overview.totalRemainingCents).toBe(-5000); // Negative
      expect(overview.percentageSpent).toBe(150); // Over 100%
    });

    it('should handle no allocations', () => {
      const expenses: Expense[] = [
        {
          id: 'exp1',
          userId: 'user1',
          occurredAt: new Date(),
          amountCents: 5000,
          categoryId: 'cat1',
          subcategoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations: [],
        expenses,
        categories: mockCategories,
        subcategories: mockSubcategories,
      });

      expect(overview.totalAllocatedCents).toBe(0);
      expect(overview.totalSpentCents).toBe(5000);
      expect(overview.totalRemainingCents).toBe(-5000);
      expect(overview.percentageSpent).toBe(0); // Can't divide by zero
    });

    it('should handle no expenses', () => {
      const allocations: BudgetAllocation[] = [
        {
          id: 'alloc1',
          budgetId: 'budget1',
          categoryId: 'cat1',
          subcategoryId: null,
          amountCents: 10000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations,
        expenses: [],
        categories: mockCategories,
        subcategories: mockSubcategories,
      });

      expect(overview.totalAllocatedCents).toBe(10000);
      expect(overview.totalSpentCents).toBe(0);
      expect(overview.totalRemainingCents).toBe(10000);
      expect(overview.percentageSpent).toBe(0);
    });

    it('should exclude archived categories', () => {
      const archivedCategories: Category[] = [
        ...mockCategories,
        {
          id: 'cat3',
          userId: 'user1',
          name: 'Archived',
          sortOrder: 2,
          archived: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const allocations: BudgetAllocation[] = [
        {
          id: 'alloc1',
          budgetId: 'budget1',
          categoryId: 'cat3', // Archived category
          subcategoryId: null,
          amountCents: 10000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations,
        expenses: [],
        categories: archivedCategories,
        subcategories: mockSubcategories,
      });

      // Should not include archived category
      expect(overview.categories.find((c) => c.categoryId === 'cat3')).toBeUndefined();
    });

    it('should handle subcategories correctly', () => {
      const allocations: BudgetAllocation[] = [
        {
          id: 'alloc1',
          budgetId: 'budget1',
          categoryId: 'cat1',
          subcategoryId: 'sub1',
          amountCents: 30000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'alloc2',
          budgetId: 'budget1',
          categoryId: 'cat1',
          subcategoryId: 'sub2',
          amountCents: 20000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expenses: Expense[] = [
        {
          id: 'exp1',
          userId: 'user1',
          occurredAt: new Date(),
          amountCents: 10000,
          categoryId: 'cat1',
          subcategoryId: 'sub1',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const overview = calculateMonthBudgetOverview({
        budgetId: 'budget1',
        monthKey: '2026-01',
        allocations,
        expenses,
        categories: mockCategories,
        subcategories: mockSubcategories,
      });

      const groceries = overview.categories.find((c) => c.categoryId === 'cat1');
      expect(groceries).toBeDefined();
      expect(groceries!.subcategories).toHaveLength(2);

      const supermarket = groceries!.subcategories.find((s) => s.subcategoryId === 'sub1');
      expect(supermarket).toBeDefined();
      expect(supermarket!.allocatedCents).toBe(30000);
      expect(supermarket!.spentCents).toBe(10000);
      expect(supermarket!.remainingCents).toBe(20000);

      const restaurants = groceries!.subcategories.find((s) => s.subcategoryId === 'sub2');
      expect(restaurants).toBeDefined();
      expect(restaurants!.allocatedCents).toBe(20000);
      expect(restaurants!.spentCents).toBe(0);
    });
  });
});
