import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  description: string;
  date: string;
  category: { id: string; name: string; type: string };
  subcategory?: { id: string; name: string } | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'expense' | 'income' | '';
  categoryId?: string;
  subcategoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.type) params.set('type', filters.type);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.subcategoryId) params.set('subcategoryId', filters.subcategoryId);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const { data } = await api.get<TransactionsResponse>(
        `/transactions?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data } = await api.post<{ transaction: Transaction }>(
        '/transactions',
        input
      );
      return data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Transaction created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create transaction');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<CreateTransactionInput> & { id: string }) => {
      const { data } = await api.put<{ transaction: Transaction }>(
        `/transactions/${id}`,
        input
      );
      return data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update transaction');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transaction');
    },
  });
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post('/transactions/bulk-delete', { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Transactions deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transactions');
    },
  });
}

export async function exportTransactions(
  filters: TransactionFilters = {}
): Promise<void> {
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

    toast.success('Transactions exported successfully');
  } catch {
    toast.error('Failed to export transactions');
  }
}
