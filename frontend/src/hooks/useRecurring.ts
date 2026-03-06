import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { parseError } from '@/lib/api';
import { toast } from 'sonner';
import type { RecurringTransaction } from '@fin-health/shared/types';

export type { RecurringTransaction };

interface RecurringResponse {
  recurringTransactions: RecurringTransaction[];
}

interface CreateRecurringPayload {
  amount: number;
  type: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  categoryName: string;
  subcategoryName?: string | null;
  notes?: string | null;
}

interface UpdateRecurringPayload extends Partial<CreateRecurringPayload> {
  id: string;
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const { data } = await api.get<RecurringResponse>('/recurring');
      return data.recurringTransactions;
    },
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRecurringPayload) => {
      const { data } = await api.post('/recurring', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction created');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRecurringPayload) => {
      const { data } = await api.put(`/recurring/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction updated');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recurring/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction deleted');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useToggleRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/recurring/${id}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success('Recurring transaction toggled');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}
