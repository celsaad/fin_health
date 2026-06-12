import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import type { Budget } from '@fin-health/shared/types';

export type { Budget };

export function useBudgets(month: number, year: number) {
  const { currency } = useUserPreferences();
  const result = trpc.budgets.list.useQuery({ month, year, currency });
  return { ...result, data: result.data?.budgets };
}

export function useUpsertBudget() {
  const utils = trpc.useUtils();

  return trpc.budgets.upsert.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      toast.success(i18n.t('toasts.budgetSaved'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCopyPreviousMonthBudgets() {
  const utils = trpc.useUtils();

  return trpc.budgets.copyPrevious.useMutation({
    onSuccess: (data) => {
      utils.budgets.list.invalidate();
      if (data.copied > 0) {
        toast.success(i18n.t('toasts.budgetsCopied', { count: data.copied }));
      } else {
        toast.info(i18n.t('toasts.budgetsCopyNoResults'));
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteBudget() {
  const utils = trpc.useUtils();

  return trpc.budgets.delete.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      toast.success(i18n.t('toasts.budgetDeleted'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
