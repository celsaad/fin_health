import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

interface BudgetWithSpent {
  id: string;
  amount: Decimal;
  month: number;
  year: number;
  isRecurring: boolean;
  categoryId: string | null;
  categoryName: string | null;
  category: { id: string; name: string } | null;
  spent: string;
  remaining: string;
}

export async function getBudgetsWithSpent(
  userId: string,
  month: number,
  year: number
): Promise<BudgetWithSpent[]> {
  // Get budgets matching the requested month/year OR recurring budgets (month=0, year=0)
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      OR: [
        { month, year },
        { month: 0, year: 0, isRecurring: true },
      ],
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  // Merge: specific budgets take precedence over recurring ones for the same category
  const budgetMap = new Map<string | null, (typeof budgets)[number]>();
  for (const budget of budgets) {
    const key = budget.categoryId;
    const existing = budgetMap.get(key);
    if (!existing || (!budget.isRecurring && existing.isRecurring)) {
      budgetMap.set(key, budget);
    }
  }
  const mergedBudgets = Array.from(budgetMap.values());

  // Calculate the date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Get expense totals grouped by category for the month
  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const expensesByCategory = new Map<string, Decimal>();
  let overallSpent = new Decimal(0);
  for (const e of expenses) {
    if (e._sum.amount) {
      expensesByCategory.set(e.categoryId, e._sum.amount);
      overallSpent = overallSpent.add(e._sum.amount);
    }
  }

  return mergedBudgets.map((budget) => {
    let spent: Decimal;

    if (budget.categoryId) {
      // Category-specific budget
      spent = expensesByCategory.get(budget.categoryId) || new Decimal(0);
    } else {
      // Overall budget
      spent = overallSpent;
    }

    const remaining = budget.amount.sub(spent);

    return {
      id: budget.id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      isRecurring: budget.isRecurring,
      categoryId: budget.categoryId,
      categoryName: budget.category?.name || null,
      category: budget.category || null,
      spent: spent.toString(),
      remaining: remaining.toString(),
    };
  });
}
