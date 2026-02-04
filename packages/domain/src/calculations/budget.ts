/**
 * Budget calculation logic
 */

import type {
  BudgetAllocation,
  Expense,
  Category,
  Subcategory,
  MonthBudgetOverview,
  CategoryBudgetSummary,
  SubcategoryBudgetSummary,
} from '../types/index.js';
import { sum, subtract, percentage } from '../utils/money.js';

/**
 * Calculate month budget overview from allocations and expenses
 */
export function calculateMonthBudgetOverview(params: {
  budgetId: string | null;
  monthKey: string;
  allocations: BudgetAllocation[];
  expenses: Expense[];
  categories: Category[];
  subcategories: Subcategory[];
}): MonthBudgetOverview {
  const { budgetId, monthKey, allocations, expenses, categories, subcategories } = params;

  // Build lookup maps
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const subcategoryMap = new Map(subcategories.map((s) => [s.id, s]));

  // Group allocations by category and subcategory
  const categoryAllocations = new Map<string, Map<string | null, number>>();

  for (const allocation of allocations) {
    if (!categoryAllocations.has(allocation.categoryId)) {
      categoryAllocations.set(allocation.categoryId, new Map());
    }
    const subcategoryMap = categoryAllocations.get(allocation.categoryId)!;
    subcategoryMap.set(allocation.subcategoryId, allocation.amountCents);
  }

  // Group expenses by category and subcategory
  const categoryExpenses = new Map<string, Map<string | null, number>>();

  for (const expense of expenses) {
    if (!categoryExpenses.has(expense.categoryId)) {
      categoryExpenses.set(expense.categoryId, new Map());
    }
    const subcategoryMap = categoryExpenses.get(expense.categoryId)!;
    const currentAmount = subcategoryMap.get(expense.subcategoryId) || 0;
    subcategoryMap.set(expense.subcategoryId, currentAmount + expense.amountCents);
  }

  // Build category summaries
  const categorySummaries: CategoryBudgetSummary[] = [];

  // Get all unique category IDs from both allocations and expenses
  const allCategoryIds = new Set([
    ...categoryAllocations.keys(),
    ...categoryExpenses.keys(),
  ]);

  for (const categoryId of allCategoryIds) {
    const category = categoryMap.get(categoryId);
    if (!category || category.archived) {
      continue; // Skip archived or deleted categories
    }

    const subcategoryAllocations = categoryAllocations.get(categoryId) || new Map();
    const subcategoryExpenses = categoryExpenses.get(categoryId) || new Map();

    // Get all unique subcategory IDs
    const allSubcategoryIds = new Set([
      ...subcategoryAllocations.keys(),
      ...subcategoryExpenses.keys(),
    ]);

    const subcategorySummaries: SubcategoryBudgetSummary[] = [];

    for (const subcategoryId of allSubcategoryIds) {
      const allocatedCents = subcategoryAllocations.get(subcategoryId) || 0;
      const spentCents = subcategoryExpenses.get(subcategoryId) || 0;
      const remainingCents = subtract(allocatedCents, spentCents);
      const percentageSpent = percentage(spentCents, allocatedCents);

      // Only include subcategory if it has a valid ID and exists
      if (subcategoryId) {
        const subcategory = subcategoryMap.get(subcategoryId);
        if (subcategory && !subcategory.archived) {
          subcategorySummaries.push({
            subcategoryId,
            subcategoryName: subcategory.name,
            allocatedCents,
            spentCents,
            remainingCents,
            percentageSpent,
          });
        }
      }
    }

    // Calculate category totals
    const categoryAllocatedCents = sum(
      Array.from(subcategoryAllocations.values())
    );
    const categorySpentCents = sum(
      Array.from(subcategoryExpenses.values())
    );
    const categoryRemainingCents = subtract(categoryAllocatedCents, categorySpentCents);
    const categoryPercentageSpent = percentage(categorySpentCents, categoryAllocatedCents);

    categorySummaries.push({
      categoryId,
      categoryName: category.name,
      allocatedCents: categoryAllocatedCents,
      spentCents: categorySpentCents,
      remainingCents: categoryRemainingCents,
      percentageSpent: categoryPercentageSpent,
      subcategories: subcategorySummaries.sort((a, b) => {
        // Sort subcategories by name
        return a.subcategoryName.localeCompare(b.subcategoryName);
      }),
    });
  }

  // Sort categories by name
  categorySummaries.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  // Calculate totals
  const totalAllocatedCents = sum(categorySummaries.map((c) => c.allocatedCents));
  const totalSpentCents = sum(categorySummaries.map((c) => c.spentCents));
  const totalRemainingCents = subtract(totalAllocatedCents, totalSpentCents);
  const totalPercentageSpent = percentage(totalSpentCents, totalAllocatedCents);

  return {
    monthKey,
    budgetId,
    totalAllocatedCents,
    totalSpentCents,
    totalRemainingCents,
    percentageSpent: totalPercentageSpent,
    categories: categorySummaries,
  };
}
