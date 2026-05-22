import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function useBudgets(month: number, year: number) {
  const result = trpc.budgets.list.useQuery({ month, year });
  return { ...result, data: result.data?.budgets };
}

export function useUpsertBudget() {
  const utils = trpc.useUtils();

  return trpc.budgets.upsert.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      toast.success('Budget saved successfully');
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
        toast.success(`Copied ${data.copied} budget(s) from last month`);
      } else {
        toast.info('No budgets to copy from last month');
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
      toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
