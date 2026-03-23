import api from './api';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function getSummary(month: number, year: number) {
  const { data } = await api.get('/dashboard/summary', { params: { month, year } });
  return data;
}

export async function getBreakdown(month: number, year: number) {
  const { data } = await api.get('/dashboard/breakdown', { params: { month, year } });
  return data;
}

export async function getCategoryBreakdown(month: number, year: number) {
  const { data } = await api.get('/dashboard/category-breakdown', { params: { month, year } });
  return data;
}

export async function getTrend(months = 6) {
  const { data } = await api.get('/dashboard/trend', { params: { months } });
  return data;
}

export async function getYearlyOverview(year: number) {
  const { data } = await api.get('/dashboard/yearly', { params: { year } });
  return data;
}

export interface Insight {
  type: 'pace' | 'over-budget' | 'unusual' | 'increase' | 'decrease';
  title: string;
  description: string;
  sentiment: 'positive' | 'negative' | 'warning' | 'neutral';
  metadata?: Record<string, unknown>;
}

export async function getInsights(month: number, year: number) {
  const { data } = await api.get<{ insights: Insight[] }>('/dashboard/insights', {
    params: { month, year },
  });
  return data;
}

export async function getRecentPeaks(month: number, year: number, limit = 5) {
  const date = new Date(year, month - 1);
  const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
  const { data } = await api.get('/transactions', {
    params: { startDate, endDate, sortBy: 'amount', sortOrder: 'desc', limit, type: 'expense' },
  });
  return data;
}
