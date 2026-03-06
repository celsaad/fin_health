import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

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

type SummaryResponse = DashboardSummary;

interface BreakdownResponse {
  breakdown: BreakdownItem[];
}

interface YearlyResponse {
  months: MonthlyData[];
}

interface TrendResponse {
  trend: TrendData[];
}

interface CategoryBreakdownResponse {
  categories: CategorySpending[];
}

export function useSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: async () => {
      const { data } = await api.get<SummaryResponse>('/dashboard/summary', {
        params: { month, year },
      });
      return data;
    },
  });
}

export function useBreakdown(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'breakdown', month, year],
    queryFn: async () => {
      const { data } = await api.get<BreakdownResponse>('/dashboard/breakdown', {
        params: { month, year },
      });
      return data.breakdown;
    },
  });
}

export function useYearlyOverview(year: number) {
  return useQuery({
    queryKey: ['dashboard', 'yearly', year],
    queryFn: async () => {
      const { data } = await api.get<YearlyResponse>('/dashboard/yearly', {
        params: { year },
      });
      return data.months;
    },
  });
}

export function useCategoryBreakdown(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'category-breakdown', month, year],
    queryFn: async () => {
      const { data } = await api.get<CategoryBreakdownResponse>('/dashboard/category-breakdown', {
        params: { month, year },
      });
      return data.categories;
    },
  });
}

export function useTrend(months: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'trend', months],
    queryFn: async () => {
      const { data } = await api.get<TrendResponse>('/dashboard/trend', {
        params: { months },
      });
      return data.trend;
    },
  });
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

interface InsightsResponse {
  insights: Insight[];
}

export function useInsights(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'insights', month, year],
    queryFn: async () => {
      const { data } = await api.get<InsightsResponse>('/dashboard/insights', {
        params: { month, year },
      });
      return data.insights;
    },
  });
}
