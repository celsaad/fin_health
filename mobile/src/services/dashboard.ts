import { startOfMonth, endOfMonth, format } from 'date-fns';
import { trpcClient } from '../lib/trpc';

export async function getSummary(month: number, year: number, currency = 'USD') {
  return trpcClient.dashboard.summary.query({ month, year, currency });
}

export async function getBreakdown(month: number, year: number, currency = 'USD') {
  return trpcClient.dashboard.breakdown.query({ month, year, currency });
}

export async function getCategoryBreakdown(month: number, year: number, currency = 'USD') {
  return trpcClient.dashboard.categoryBreakdown.query({ month, year, currency });
}

export async function getTrend(months = 6, currency = 'USD') {
  return trpcClient.dashboard.trend.query({ months, currency });
}

export async function getYearlyOverview(year: number, currency = 'USD') {
  return trpcClient.dashboard.yearly.query({ year, currency });
}

export interface Insight {
  type: 'pace' | 'over-budget' | 'unusual' | 'increase' | 'decrease';
  title: string;
  description: string;
  sentiment: 'positive' | 'negative' | 'warning' | 'neutral';
  metadata?: Record<string, unknown>;
}

export async function getInsights(month: number, year: number, currency = 'USD') {
  return trpcClient.dashboard.insights.query({ month, year, currency });
}

export async function getRecentPeaks(month: number, year: number, limit = 5) {
  const date = new Date(year, month - 1);
  const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
  return trpcClient.transactions.list.query({
    startDate,
    endDate,
    sortBy: 'amount',
    sortOrder: 'desc',
    limit,
    type: 'expense',
  });
}
