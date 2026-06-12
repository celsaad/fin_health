import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';
import { getRatePerUsd } from './exchangeRate';

interface BudgetWithSpent {
  id: string;
  amount: Decimal;
  month: number;
  year: number;
  isRecurring: boolean;
  categoryId: string | null;
  categoryName: string | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
  spent: string;
  remaining: string;
}

export async function getBudgetsWithSpent(
  userId: string,
  month: number,
  year: number,
  userCurrency: string,
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
      category: { select: { id: true, name: true, icon: true, color: true } },
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
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Get expense totals grouped by category for the month
  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amountUsd: true },
  });

  const expensesByCategory = new Map<string, Decimal>();
  let overallSpent = new Decimal(0);
  for (const e of expenses) {
    if (e._sum.amountUsd) {
      expensesByCategory.set(e.categoryId, e._sum.amountUsd);
      overallSpent = overallSpent.add(e._sum.amountUsd);
    }
  }

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);
  const toDisplay = (d: Decimal) => d.mul(rate);
  const displayByCategory = new Map<string, Decimal>(
    [...expensesByCategory.entries()].map(([k, v]) => [k, toDisplay(v)]),
  );
  const displayOverall = toDisplay(overallSpent);

  return mergedBudgets.map((budget) => {
    let spent: Decimal;

    if (budget.categoryId) {
      // Category-specific budget
      spent = displayByCategory.get(budget.categoryId) || new Decimal(0);
    } else {
      // Overall budget
      spent = displayOverall;
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
