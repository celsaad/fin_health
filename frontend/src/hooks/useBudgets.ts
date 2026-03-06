import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { parseError } from '@/lib/api';
import { toast } from 'sonner';
import type { Budget } from '@fin-health/shared/types';

export type { Budget };

interface BudgetsResponse {
  budgets: Budget[];
}

interface UpsertBudgetPayload {
  amount: number;
  month?: number;
  year?: number;
  categoryId?: string | null;
  isRecurring?: boolean;
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
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useCopyPreviousMonthBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { month: number; year: number }) => {
      const { data } = await api.post<{ budgets: Budget[]; copied: number }>(
        '/budgets/copy-previous',
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      if (data.copied > 0) {
        toast.success(`Copied ${data.copied} budget(s) from last month`);
      } else {
        toast.info('No budgets to copy from last month');
      }
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
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
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}
