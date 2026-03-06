import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

interface BudgetWithSpent {
  id: string;
  amount: Decimal;
  month: number;
  year: number;
  categoryId: string | null;
  categoryName: string | null;
  spent: string;
  remaining: string;
}

export async function getBudgetsWithSpent(
  userId: string,
  month: number,
  year: number
): Promise<BudgetWithSpent[]> {
  // Get all budgets for this month/year
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

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

  // Also get total expenses for the overall budget
  const totalExpenses = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const expensesByCategory = new Map<string, Decimal>();
  for (const e of expenses) {
    if (e._sum.amount) {
      expensesByCategory.set(e.categoryId, e._sum.amount);
    }
  }

  return budgets.map((budget) => {
    let spent: Decimal;

    if (budget.categoryId) {
      // Category-specific budget
      spent = expensesByCategory.get(budget.categoryId) || new Decimal(0);
    } else {
      // Overall budget
      spent = totalExpenses._sum.amount || new Decimal(0);
    }

    const remaining = budget.amount.sub(spent);

    return {
      id: budget.id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      categoryId: budget.categoryId,
      categoryName: budget.category?.name || null,
      spent: spent.toString(),
      remaining: remaining.toString(),
    };
  });
}
