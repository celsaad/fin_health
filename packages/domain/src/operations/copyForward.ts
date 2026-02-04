/**
 * Copy-forward operations for budget allocations
 */

import type { BudgetAllocation, Budget, MonthKey } from '../types/index.js';
import { getPreviousMonthKey } from '../utils/monthKey.js';

/**
 * Copy allocations from one budget to another
 * Returns the allocations ready to be created (without IDs or timestamps)
 */
export function copyAllocationsForward(params: {
  sourceAllocations: BudgetAllocation[];
  targetBudgetId: string;
}): Omit<BudgetAllocation, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { sourceAllocations, targetBudgetId } = params;

  return sourceAllocations.map((allocation) => ({
    budgetId: targetBudgetId,
    categoryId: allocation.categoryId,
    subcategoryId: allocation.subcategoryId,
    amountCents: allocation.amountCents,
  }));
}

/**
 * Determine if we should copy from previous month
 * Returns the monthKey to copy from, or null if no copy should happen
 */
export function shouldCopyFromPreviousMonth(params: {
  currentMonthKey: MonthKey;
  existingBudgets: Budget[];
}): MonthKey | null {
  const { currentMonthKey, existingBudgets } = params;

  // Get previous month key
  const previousMonthKey = getPreviousMonthKey(currentMonthKey);

  // Check if there's a budget for previous month
  const previousBudget = existingBudgets.find((b) => b.monthKey === previousMonthKey);

  if (!previousBudget) {
    return null; // No previous budget to copy from
  }

  return previousMonthKey;
}

/**
 * Find the most recent budget before a given month
 */
export function findMostRecentBudget(params: {
  currentMonthKey: MonthKey;
  existingBudgets: Budget[];
}): Budget | null {
  const { currentMonthKey, existingBudgets } = params;

  // Filter budgets that are before current month and sort by monthKey desc
  const previousBudgets = existingBudgets
    .filter((b) => b.monthKey < currentMonthKey)
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  return previousBudgets[0] || null;
}
