import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

interface MonthlySummary {
  totalIncome: string;
  totalExpenses: string;
  net: string;
  transactionCount: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: string;
  percentage: number;
}

interface MonthlyTotal {
  month: number;
  income: string;
  expenses: string;
  net: string;
}

interface TrendPoint {
  month: number;
  year: number;
  label: string;
  income: string;
  expenses: string;
}

export async function getSummary(
  userId: string,
  month: number,
  year: number
): Promise<MonthlySummary> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const baseWhere = {
    userId,
    deletedAt: null,
    date: { gte: startDate, lte: endDate },
  };

  const [incomeAgg, expenseAgg, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'income' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'expense' },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: baseWhere }),
  ]);

  const totalIncome = incomeAgg._sum.amount || new Decimal(0);
  const totalExpenses = expenseAgg._sum.amount || new Decimal(0);
  const net = totalIncome.sub(totalExpenses);

  return {
    totalIncome: totalIncome.toString(),
    totalExpenses: totalExpenses.toString(),
    net: net.toString(),
    transactionCount: count,
  };
}

export async function getMonthlyBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<CategoryBreakdown[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  // Get category names
  const categoryIds = expenses.map((e) => e.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Calculate total for percentages
  const total = expenses.reduce(
    (sum, e) => sum.add(e._sum.amount || new Decimal(0)),
    new Decimal(0)
  );

  return expenses.map((e) => {
    const amount = e._sum.amount || new Decimal(0);
    const percentage = total.isZero()
      ? 0
      : parseFloat(amount.div(total).mul(100).toFixed(1));

    return {
      categoryId: e.categoryId,
      categoryName: categoryMap.get(e.categoryId) || 'Unknown',
      total: amount.toString(),
      percentage,
    };
  });
}

export async function getYearlyOverview(
  userId: string,
  year: number
): Promise<MonthlyTotal[]> {
  const months: MonthlyTotal[] = [];

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const baseWhere = {
      userId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: 'expense' },
        _sum: { amount: true },
      }),
    ]);

    const income = incomeAgg._sum.amount || new Decimal(0);
    const expenses = expenseAgg._sum.amount || new Decimal(0);

    months.push({
      month,
      income: income.toString(),
      expenses: expenses.toString(),
      net: income.sub(expenses).toString(),
    });
  }

  return months;
}

export async function getTrend(
  userId: string,
  months: number
): Promise<TrendPoint[]> {
  const now = new Date();
  const points: TrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const baseWhere = {
      userId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: 'expense' },
        _sum: { amount: true },
      }),
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    points.push({
      month,
      year,
      label: `${monthNames[month - 1]} ${year}`,
      income: (incomeAgg._sum.amount || new Decimal(0)).toString(),
      expenses: (expenseAgg._sum.amount || new Decimal(0)).toString(),
    });
  }

  return points;
}
