import { trpc } from '@/lib/trpc';
import { useTransactions } from '@/hooks/useTransactions';
import { endOfMonth, format } from 'date-fns';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  transactionCount: number;
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface MonthlyData {
  month: number;
  income: number;
  expenses: number;
  net: number;
}

export interface TrendData {
  month: number;
  year: number;
  income: number;
  expenses: number;
}

export interface SubcategoryBreakdown {
  subcategoryId: string | null;
  subcategoryName: string;
  total: number;
  percentage: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  subcategories: SubcategoryBreakdown[];
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

export function useSummary(month: number, year: number) {
  return trpc.dashboard.summary.useQuery({ month, year });
}

export function useBreakdown(month: number, year: number) {
  const result = trpc.dashboard.breakdown.useQuery({ month, year });
  return { ...result, data: result.data?.breakdown };
}

export function useYearlyOverview(year: number) {
  const result = trpc.dashboard.yearly.useQuery({ year });
  return { ...result, data: result.data?.months };
}

export function useCategoryBreakdown(month: number, year: number) {
  const result = trpc.dashboard.categoryBreakdown.useQuery({ month, year });
  return { ...result, data: result.data?.categories };
}

export function useTrend(months: number = 6) {
  const result = trpc.dashboard.trend.useQuery({ months });
  return { ...result, data: result.data?.trend };
}

export function useInsights(month: number, year: number, enabled = true) {
  const result = trpc.dashboard.insights.useQuery({ month, year }, { enabled });
  return { ...result, data: result.data?.insights };
}

export function useRecentPeaks(month: number, year: number) {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd');

  const query = useTransactions({
    type: 'expense',
    sortBy: 'amount',
    sortOrder: 'desc',
    limit: 5,
    startDate: monthStart,
    endDate: monthEnd,
  });

  return {
    ...query,
    data: query.data?.transactions,
  };
}
