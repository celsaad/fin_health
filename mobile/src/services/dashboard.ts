import api from './api';

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
