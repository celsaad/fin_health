import api from './api';
import type { RecurringTransaction } from '@fin-health/shared/types';

export async function getRecurringTransactions(): Promise<{
  recurringTransactions: RecurringTransaction[];
}> {
  const { data } = await api.get('/recurring');
  return data;
}

export async function createRecurring(body: {
  amount: string;
  type: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  categoryName: string;
  subcategoryName?: string;
  notes?: string;
}) {
  const { data } = await api.post('/recurring', body);
  return data.recurringTransaction;
}

export async function updateRecurring(
  id: string,
  body: Partial<{
    amount: string;
    type: string;
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    categoryName: string;
    subcategoryName?: string | null;
    notes?: string | null;
  }>
) {
  const { data } = await api.put(`/recurring/${id}`, body);
  return data.recurringTransaction;
}

export async function toggleRecurring(id: string) {
  const { data } = await api.patch(`/recurring/${id}/toggle`);
  return data.recurringTransaction;
}

export async function deleteRecurring(id: string) {
  await api.delete(`/recurring/${id}`);
}
