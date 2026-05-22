import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import type { RecurringTransaction } from '@fin-health/shared/types';

export type { RecurringTransaction };

export interface CreateRecurringPayload {
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

export interface UpdateRecurringPayload extends Partial<CreateRecurringPayload> {
  id: string;
}

export function useRecurringTransactions() {
  const result = trpc.recurring.list.useQuery();
  return { ...result, data: result.data?.recurringTransactions };
}

export function useCreateRecurring() {
  const utils = trpc.useUtils();

  return trpc.recurring.create.useMutation({
    onSuccess: () => {
      utils.recurring.list.invalidate();
      toast.success('Recurring transaction created');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRecurring() {
  const utils = trpc.useUtils();

  return trpc.recurring.update.useMutation({
    onSuccess: () => {
      utils.recurring.list.invalidate();
      toast.success('Recurring transaction updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRecurring() {
  const utils = trpc.useUtils();

  return trpc.recurring.delete.useMutation({
    onSuccess: () => {
      utils.recurring.list.invalidate();
      toast.success('Recurring transaction deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleRecurring() {
  const utils = trpc.useUtils();

  return trpc.recurring.toggle.useMutation({
    onSuccess: () => {
      utils.recurring.list.invalidate();
      toast.success('Recurring transaction toggled');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
