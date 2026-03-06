import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  category: { id: string; name: string; type: string; icon?: string | null; color?: string | null };
  subcategory?: { id: string; name: string } | null;
  notes?: string | null;
}

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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create recurring transaction');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update recurring transaction');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete recurring transaction');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle recurring transaction');
    },
  });
}
