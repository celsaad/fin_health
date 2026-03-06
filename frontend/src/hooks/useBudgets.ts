import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  spent: number;
  remaining: number;
}

interface BudgetsResponse {
  budgets: Budget[];
}

interface UpsertBudgetPayload {
  amount: number;
  month: number;
  year: number;
  categoryId?: string | null;
}

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const { data } = await api.get<BudgetsResponse>('/budgets', {
        params: { month, year },
      });
      return data.budgets;
    },
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertBudgetPayload) => {
      const { data } = await api.post('/budgets', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save budget');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete budget');
    },
  });
}
