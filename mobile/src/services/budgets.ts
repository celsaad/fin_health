import api from './api';
import type { Budget } from '@fin-health/shared/types';

export async function getBudgets(month: number, year: number): Promise<{ budgets: Budget[] }> {
  const { data } = await api.get('/budgets', { params: { month, year } });
  return data;
}

export async function upsertBudget(body: {
  amount: string;
  month?: number;
  year?: number;
  categoryId?: string | null;
  isRecurring?: boolean;
}) {
  const { data } = await api.post('/budgets', body);
  return data.budget;
}

export async function deleteBudget(id: string) {
  await api.delete(`/budgets/${id}`);
}

export async function copyPreviousBudgets(month: number, year: number) {
  const { data } = await api.post('/budgets/copy-previous', { month, year });
  return data;
}
