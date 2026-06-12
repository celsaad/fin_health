import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import api, { parseError } from '@/lib/api';
import type { Transaction, TransactionFilters } from '@fin-health/shared/types';

export type { Transaction, TransactionFilters };

export interface CreateTransactionInput {
  amount: number;
  type: 'expense' | 'income';
  description: string;
  date: string;
  categoryName: string;
  subcategoryName?: string;
  notes?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return trpc.transactions.list.useQuery({
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    type: (filters.type || undefined) as 'expense' | 'income' | undefined,
    categoryId: filters.categoryId || undefined,
    subcategoryId: filters.subcategoryId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    search: filters.search || undefined,
    sortBy: (filters.sortBy || undefined) as
      | 'date'
      | 'amount'
      | 'description'
      | 'createdAt'
      | undefined,
    sortOrder: (filters.sortOrder || undefined) as 'asc' | 'desc' | undefined,
  });
}

export function useCreateTransaction() {
  const utils = trpc.useUtils();

  return trpc.transactions.create.useMutation({
    onSuccess: () => {
      utils.transactions.list.invalidate();
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.transactionCreated'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTransaction() {
  const utils = trpc.useUtils();

  return trpc.transactions.update.useMutation({
    onSuccess: () => {
      utils.transactions.list.invalidate();
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.transactionUpdated'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTransaction() {
  const utils = trpc.useUtils();

  return trpc.transactions.delete.useMutation({
    onSuccess: () => {
      utils.transactions.list.invalidate();
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.transactionDeleted'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useBulkDeleteTransactions() {
  const utils = trpc.useUtils();

  return trpc.transactions.bulkDelete.useMutation({
    onSuccess: () => {
      utils.transactions.list.invalidate();
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.transactionsDeleted'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// CSV export stays as a plain HTTP download (streaming response)
export async function exportTransactions(filters: TransactionFilters = {}): Promise<void> {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.search) params.set('search', filters.search);

    const response = await api.get(`/transactions/export/csv?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success(i18n.t('toasts.transactionsExported'));
  } catch (error) {
    toast.error(parseError(error).message);
  }
}
