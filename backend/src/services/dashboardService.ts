import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';
import { getRatePerUsd } from './exchangeRate';

interface MonthlySummary {
  totalIncome: string;
  totalExpenses: string;
  net: string;
  transactionCount: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: number;
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
  year: number,
  userCurrency: string,
): Promise<MonthlySummary> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const baseWhere = {
    userId,
    deletedAt: null,
    date: { gte: startDate, lte: endDate },
  };

  const [incomeAgg, expenseAgg, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'income' },
      _sum: { amountUsd: true },
    }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'expense' },
      _sum: { amountUsd: true },
    }),
    prisma.transaction.count({ where: baseWhere }),
  ]);

  const totalIncome = incomeAgg._sum.amountUsd || new Decimal(0);
  const totalExpenses = expenseAgg._sum.amountUsd || new Decimal(0);
  const net = totalIncome.sub(totalExpenses);

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);
  const toDisplay = (d: Decimal) => d.mul(rate).toDecimalPlaces(2).toString();

  return {
    totalIncome: toDisplay(totalIncome),
    totalExpenses: toDisplay(totalExpenses),
    net: toDisplay(net),
    transactionCount: count,
  };
}

export async function getMonthlyBreakdown(
  userId: string,
  month: number,
  year: number,
  userCurrency: string,
): Promise<CategoryBreakdown[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amountUsd: true },
    orderBy: { _sum: { amountUsd: 'desc' } },
  });

  // Get category names and appearance
  const categoryIds = expenses.map((e) => e.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Calculate total for percentages (in USD — ratios don't need conversion)
  const total = expenses.reduce(
    (sum, e) => sum.add(e._sum.amountUsd || new Decimal(0)),
    new Decimal(0),
  );

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);

  return expenses.map((e) => {
    const amount = e._sum.amountUsd || new Decimal(0);
    const percentage = total.isZero() ? 0 : parseFloat(amount.div(total).mul(100).toFixed(1));
    const cat = categoryMap.get(e.categoryId);

    return {
      categoryId: e.categoryId,
      categoryName: cat?.name || 'Unknown',
      icon: cat?.icon ?? null,
      color: cat?.color ?? null,
      total: parseFloat(amount.mul(rate).toString()),
      percentage,
    };
  });
}

export async function getYearlyOverview(
  userId: string,
  year: number,
  userCurrency: string,
): Promise<MonthlyTotal[]> {
  const startDate = new Date(Date.UTC(year, 0, 1));
  const endDate = new Date(Date.UTC(year + 1, 0, 1));

  const rows = await prisma.$queryRaw<Array<{ month: number; type: string; total: Decimal }>>`
    SELECT
      EXTRACT(MONTH FROM "date")::int AS "month",
      "type"::text AS "type",
      COALESCE(SUM("amountUsd"), 0) AS "total"
    FROM "Transaction"
    WHERE "userId" = ${userId}
      AND "deletedAt" IS NULL
      AND "date" >= ${startDate}
      AND "date" < ${endDate}
    GROUP BY 1, 2
  `;

  const monthData = new Map<number, { income: Decimal; expenses: Decimal }>();
  for (const row of rows) {
    let data = monthData.get(row.month);
    if (!data) {
      data = { income: new Decimal(0), expenses: new Decimal(0) };
      monthData.set(row.month, data);
    }
    if (row.type === 'income') {
      data.income = new Decimal(row.total);
    } else {
      data.expenses = new Decimal(row.total);
    }
  }

  const months: MonthlyTotal[] = [];
  for (let month = 1; month <= 12; month++) {
    const data = monthData.get(month) || {
      income: new Decimal(0),
      expenses: new Decimal(0),
    };
    months.push({
      month,
      income: data.income.toString(),
      expenses: data.expenses.toString(),
      net: data.income.sub(data.expenses).toString(),
    });
  }

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);
  return months.map((m) => ({
    ...m,
    income: new Decimal(m.income).mul(rate).toDecimalPlaces(2).toString(),
    expenses: new Decimal(m.expenses).mul(rate).toDecimalPlaces(2).toString(),
    net: new Decimal(m.net).mul(rate).toDecimalPlaces(2).toString(),
  }));
}

interface SubcategoryBreakdown {
  subcategoryId: string | null;
  subcategoryName: string;
  total: number;
  percentage: number;
}

interface CategorySpending {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  subcategories: SubcategoryBreakdown[];
}

export async function getCategoryBreakdown(
  userId: string,
  month: number,
  year: number,
  userCurrency: string,
): Promise<CategorySpending[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId', 'subcategoryId'],
    where: {
      userId,
      type: 'expense',
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amountUsd: true },
  });

  if (expenses.length === 0) return [];

  // Collect unique IDs
  const categoryIds = [...new Set(expenses.map((e) => e.categoryId))];
  const subcategoryIds = expenses
    .map((e) => e.subcategoryId)
    .filter((id): id is string => id !== null);

  // Fetch names in bulk
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    }),
    subcategoryIds.length > 0
      ? prisma.subcategory.findMany({
          where: { id: { in: subcategoryIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const subcategoryMap = new Map(subcategories.map((s) => [s.id, s.name]));

  // Overall total (in USD — used only for percentage ratios)
  const overallTotal = expenses.reduce(
    (sum, e) => sum.add(e._sum.amountUsd || new Decimal(0)),
    new Decimal(0),
  );

  // Group by category
  const categoryGroups = new Map<
    string,
    { total: Decimal; subs: { subcategoryId: string | null; total: Decimal }[] }
  >();

  for (const e of expenses) {
    const amount = e._sum.amountUsd || new Decimal(0);
    let group = categoryGroups.get(e.categoryId);
    if (!group) {
      group = { total: new Decimal(0), subs: [] };
      categoryGroups.set(e.categoryId, group);
    }
    group.total = group.total.add(amount);
    group.subs.push({ subcategoryId: e.subcategoryId, total: amount });
  }

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);

  // Build result sorted by category total descending
  const result: CategorySpending[] = [...categoryGroups.entries()]
    .sort((a, b) => (b[1].total.gt(a[1].total) ? 1 : b[1].total.lt(a[1].total) ? -1 : 0))
    .map(([categoryId, group]) => {
      const categoryPercentage = overallTotal.isZero()
        ? 0
        : parseFloat(group.total.div(overallTotal).mul(100).toFixed(1));

      const subcats: SubcategoryBreakdown[] = group.subs
        .sort((a, b) => (b.total.gt(a.total) ? 1 : b.total.lt(a.total) ? -1 : 0))
        .map((sub) => ({
          subcategoryId: sub.subcategoryId,
          subcategoryName: sub.subcategoryId
            ? subcategoryMap.get(sub.subcategoryId) || 'Unknown'
            : 'Uncategorized',
          total: parseFloat(sub.total.mul(rate).toString()),
          percentage: group.total.isZero()
            ? 0
            : parseFloat(sub.total.div(group.total).mul(100).toFixed(1)),
        }));

      return {
        categoryId,
        categoryName: categoryMap.get(categoryId) || 'Unknown',
        total: parseFloat(group.total.mul(rate).toString()),
        percentage: categoryPercentage,
        subcategories: subcats,
      };
    });

  return result;
}

export type InsightSentiment = 'positive' | 'negative' | 'warning' | 'neutral';
export type InsightType = 'pace' | 'over-budget' | 'unusual' | 'increase' | 'decrease';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  sentiment: InsightSentiment;
  metadata?: Record<string, unknown>;
}

export async function getInsights(
  userId: string,
  month: number,
  year: number,
  userCurrency: string,
): Promise<Insight[]> {
  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: userCurrency,
    maximumFractionDigits: 0,
  });
  const fmt = (n: number) => currencyFormatter.format(n);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Previous month range
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStartDate = new Date(Date.UTC(prevYear, prevMonth - 1, 1));
  const prevEndDate = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

  // 3-month rolling window (the 3 months before current)
  const rolling3Start = new Date(Date.UTC(year, month - 4, 1));
  const rolling3End = new Date(Date.UTC(year, month - 1, 0, 23, 59, 59, 999));

  const baseWhere = { userId, type: 'expense' as const, deletedAt: null };

  // 4 parallel queries
  const [currentExpenses, prevExpenses, rollingExpenses, budgets] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...baseWhere, date: { gte: startDate, lte: endDate } },
      _sum: { amountUsd: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...baseWhere, date: { gte: prevStartDate, lte: prevEndDate } },
      _sum: { amountUsd: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...baseWhere, date: { gte: rolling3Start, lte: rolling3End } },
      _sum: { amountUsd: true },
    }),
    prisma.budget.findMany({
      where: {
        userId,
        OR: [
          { month, year },
          { month: 0, year: 0, isRecurring: true },
        ],
      },
    }),
  ]);

  // Resolve category names
  const allCategoryIds = [
    ...new Set([
      ...currentExpenses.map((e) => e.categoryId),
      ...prevExpenses.map((e) => e.categoryId),
      ...rollingExpenses.map((e) => e.categoryId),
    ]),
  ];
  const categories = await prisma.category.findMany({
    where: { id: { in: allCategoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map<string, string>(categories.map((c) => [c.id, c.name]));

  // Build lookup maps (converted from USD to the user's display currency)
  const toAmount = (d: Decimal | null) => parseFloat((d || new Decimal(0)).toString()) * rate;
  const currentMap = new Map<string, number>(
    currentExpenses.map((e) => [e.categoryId, toAmount(e._sum.amountUsd)]),
  );
  const prevMap = new Map<string, number>(
    prevExpenses.map((e) => [e.categoryId, toAmount(e._sum.amountUsd)]),
  );
  const rollingMap = new Map<string, number>(
    rollingExpenses.map((e) => [e.categoryId, toAmount(e._sum.amountUsd) / 3]),
  );

  // Budget lookup: categoryId → amount (null categoryId = overall budget)
  const budgetMap = new Map<string | null, number>(
    budgets.map((b) => [b.categoryId, parseFloat(b.amount.toString())]),
  );

  const insights: Insight[] = [];

  // 1. Spending pace
  const totalCurrentExpenses = [...currentMap.values()].reduce((s, v) => s + v, 0);
  const now = new Date();
  const isCurrentMonth = month === now.getUTCMonth() + 1 && year === now.getUTCFullYear();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (isCurrentMonth) {
    const daysElapsed = now.getDate();
    const projected = (totalCurrentExpenses / daysElapsed) * daysInMonth;
    const overallBudget = budgetMap.get(null);

    if (overallBudget) {
      const diff = projected - overallBudget;
      if (diff > 0) {
        insights.push({
          type: 'pace',
          title: 'Over-budget pace',
          description: `At this pace, you'll spend ${fmt(projected)} — ${fmt(diff)} over your ${fmt(overallBudget)} budget.`,
          sentiment: 'negative',
          metadata: {
            projected: Math.round(projected),
            budget: overallBudget,
            overage: Math.round(diff),
          },
        });
      } else {
        insights.push({
          type: 'pace',
          title: 'On track',
          description: `Projected spending of ${fmt(projected)} is within your ${fmt(overallBudget)} budget.`,
          sentiment: 'positive',
          metadata: { projected: Math.round(projected), budget: overallBudget },
        });
      }
    } else if (totalCurrentExpenses > 0) {
      insights.push({
        type: 'pace',
        title: 'Spending pace',
        description: `You've spent ${fmt(totalCurrentExpenses)} so far — on pace for ${fmt(projected)} this month.`,
        sentiment: 'neutral',
        metadata: { spent: Math.round(totalCurrentExpenses), projected: Math.round(projected) },
      });
    }
  } else if (totalCurrentExpenses > 0) {
    insights.push({
      type: 'pace',
      title: 'Total spending',
      description: `You spent ${fmt(totalCurrentExpenses)} this month.`,
      sentiment: 'neutral',
      metadata: { total: Math.round(totalCurrentExpenses) },
    });
  }

  // 2 & 3. Biggest category increase / decrease vs last month
  let biggestIncrease: { name: string; delta: number } | null = null;
  let biggestDecrease: { name: string; delta: number } | null = null;

  for (const [catId, current] of currentMap) {
    const prev = prevMap.get(catId) || 0;
    const delta = current - prev;
    const name = categoryMap.get(catId) || 'Unknown';

    if (delta > 0 && (!biggestIncrease || delta > biggestIncrease.delta)) {
      biggestIncrease = { name, delta };
    }
    if (delta < 0 && (!biggestDecrease || delta < biggestDecrease.delta)) {
      biggestDecrease = { name, delta };
    }
  }

  // 4. Over-budget categories
  let overBudgetCount = 0;
  const overBudgetNames: string[] = [];
  for (const [catId, budgetAmount] of budgetMap) {
    if (catId === null) continue; // skip overall budget
    const spent = currentMap.get(catId) || 0;
    if (spent > budgetAmount) {
      overBudgetCount++;
      overBudgetNames.push(categoryMap.get(catId) || 'Unknown');
    }
  }

  if (overBudgetCount > 0) {
    const names = overBudgetNames.slice(0, 3).join(', ');
    const extra = overBudgetCount > 3 ? ` and ${overBudgetCount - 3} more` : '';
    insights.push({
      type: 'over-budget',
      title: `${overBudgetCount} ${overBudgetCount === 1 ? 'category' : 'categories'} over budget`,
      description: `${names}${extra} exceeded ${overBudgetCount === 1 ? 'its' : 'their'} budget.`,
      sentiment: 'warning',
      metadata: { count: overBudgetCount, categories: overBudgetNames },
    });
  }

  // 5. Unusual spending (>50% above 3-month average)
  let mostUnusual: { name: string; current: number; avg: number; pct: number } | null = null;
  for (const [catId, current] of currentMap) {
    const avg = rollingMap.get(catId);
    if (!avg || avg === 0) continue;
    const pctAbove = ((current - avg) / avg) * 100;
    if (pctAbove > 50 && (!mostUnusual || pctAbove > mostUnusual.pct)) {
      mostUnusual = { name: categoryMap.get(catId) || 'Unknown', current, avg, pct: pctAbove };
    }
  }

  if (mostUnusual) {
    insights.push({
      type: 'unusual',
      title: `Unusual spending in ${mostUnusual.name}`,
      description: `${fmt(mostUnusual.current)} vs ${fmt(mostUnusual.avg)} average — ${Math.round(mostUnusual.pct)}% above normal.`,
      sentiment: 'warning',
      metadata: {
        category: mostUnusual.name,
        current: mostUnusual.current,
        average: mostUnusual.avg,
        percentAbove: Math.round(mostUnusual.pct),
      },
    });
  }

  if (biggestIncrease) {
    insights.push({
      type: 'increase',
      title: `${biggestIncrease.name} is up`,
      description: `Up ${fmt(biggestIncrease.delta)} compared to last month.`,
      sentiment: 'negative',
      metadata: { category: biggestIncrease.name, delta: Math.round(biggestIncrease.delta) },
    });
  }

  if (biggestDecrease) {
    insights.push({
      type: 'decrease',
      title: `${biggestDecrease.name} is down`,
      description: `Down ${fmt(Math.abs(biggestDecrease.delta))} compared to last month.`,
      sentiment: 'positive',
      metadata: { category: biggestDecrease.name, delta: Math.round(biggestDecrease.delta) },
    });
  }

  return insights;
}

export async function getTrend(
  userId: string,
  months: number,
  userCurrency: string,
): Promise<TrendPoint[]> {
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const rows = await prisma.$queryRaw<
    Array<{ month: number; year: number; type: string; total: Decimal }>
  >`
    SELECT
      EXTRACT(MONTH FROM "date")::int AS "month",
      EXTRACT(YEAR FROM "date")::int AS "year",
      "type"::text AS "type",
      COALESCE(SUM("amountUsd"), 0) AS "total"
    FROM "Transaction"
    WHERE "userId" = ${userId}
      AND "deletedAt" IS NULL
      AND "date" >= ${startDate}
      AND "date" < ${endDate}
    GROUP BY 1, 2, 3
  `;

  const dataMap = new Map<string, { income: Decimal; expenses: Decimal }>();
  for (const row of rows) {
    const key = `${row.year}-${row.month}`;
    let data = dataMap.get(key);
    if (!data) {
      data = { income: new Decimal(0), expenses: new Decimal(0) };
      dataMap.set(key, data);
    }
    if (row.type === 'income') {
      data.income = new Decimal(row.total);
    } else {
      data.expenses = new Decimal(row.total);
    }
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    const key = `${year}-${month}`;
    const data = dataMap.get(key) || {
      income: new Decimal(0),
      expenses: new Decimal(0),
    };

    points.push({
      month,
      year,
      label: `${monthNames[month - 1]} ${year}`,
      income: data.income.toString(),
      expenses: data.expenses.toString(),
    });
  }

  const rate = userCurrency === 'USD' ? 1 : await getRatePerUsd(userCurrency);
  return points.map((p) => ({
    ...p,
    income: new Decimal(p.income).mul(rate).toDecimalPlaces(2).toString(),
    expenses: new Decimal(p.expenses).mul(rate).toDecimalPlaces(2).toString(),
  }));
}
