import { trpcClient } from '../lib/trpc';
import type { TransactionFilters } from '@fin-health/shared/types';

export async function getTransactions(filters: TransactionFilters) {
  return trpcClient.transactions.list.query({
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    type: (filters.type || undefined) as 'expense' | 'income' | undefined,
    categoryId: filters.categoryId || undefined,
    subcategoryId: filters.subcategoryId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    search: filters.search || undefined,
    sortBy: (filters.sortBy || undefined) as 'date' | 'amount' | 'description' | 'createdAt' | undefined,
    sortOrder: (filters.sortOrder || undefined) as 'asc' | 'desc' | undefined,
  });
}

export async function getTransaction(id: string) {
  const result = await trpcClient.transactions.byId.query({ id });
  return result.transaction;
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
  const result = await trpcClient.transactions.create.mutate({
    amount: body.amount,
    type: body.type as 'expense' | 'income',
    description: body.description,
    date: body.date,
    categoryName: body.categoryName,
    subcategoryName: body.subcategoryName,
    notes: body.notes,
  });
  return result.transaction;
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
  }>,
) {
  const result = await trpcClient.transactions.update.mutate({
    id,
    ...body,
    type: body.type as 'expense' | 'income' | undefined,
  });
  return result.transaction;
}

export async function deleteTransaction(id: string) {
  return trpcClient.transactions.delete.mutate({ id });
}

export async function bulkDeleteTransactions(ids: string[]) {
  return trpcClient.transactions.bulkDelete.mutate({ ids });
}
