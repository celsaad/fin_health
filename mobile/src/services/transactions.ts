import api from './api';
import type { TransactionFilters, PaginatedResponse, Transaction } from '@fin-health/shared/types';

export async function getTransactions(
  filters: TransactionFilters
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await api.get('/transactions', { params: filters });
  return data;
}

export async function getTransaction(id: string) {
  const { data } = await api.get(`/transactions/${id}`);
  return data.transaction;
}

export async function createTransaction(body: {
  amount: string;
  type: string;
  description: string;
  date: string;
  categoryName: string;
  subcategoryName?: string;
  notes?: string;
}) {
  const { data } = await api.post('/transactions', body);
  return data.transaction;
}

export async function updateTransaction(
  id: string,
  body: Partial<{
    amount: string;
    type: string;
    description: string;
    date: string;
    categoryName: string;
    subcategoryName?: string | null;
    notes?: string | null;
  }>
) {
  const { data } = await api.put(`/transactions/${id}`, body);
  return data.transaction;
}

export async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`);
}

export async function bulkDeleteTransactions(ids: string[]) {
  const { data } = await api.post('/transactions/bulk-delete', { ids });
  return data;
}
