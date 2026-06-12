import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import type { Category, Subcategory } from '@fin-health/shared/types';

export type { Category, Subcategory };

export function useCategories() {
  const result = trpc.categories.list.useQuery();
  return { ...result, data: result.data?.categories };
}

export function useCreateSubcategory() {
  const utils = trpc.useUtils();

  return trpc.categories.createSubcategory.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.subcategoryCreated'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRenameCategory() {
  const utils = trpc.useUtils();

  return trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.categoryRenamed'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRenameSubcategory() {
  const utils = trpc.useUtils();

  return trpc.categories.renameSubcategory.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.subcategoryRenamed'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const utils = trpc.useUtils();

  return trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.categoryDeleted'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSubcategory() {
  const utils = trpc.useUtils();

  return trpc.categories.deleteSubcategory.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success(i18n.t('toasts.subcategoryDeleted'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategoryAppearance() {
  const utils = trpc.useUtils();

  return trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      utils.transactions.list.invalidate();
      utils.budgets.list.invalidate();
      utils.recurring.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useMergeCategory() {
  const utils = trpc.useUtils();

  return trpc.categories.merge.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      utils.transactions.list.invalidate();
      toast.success(i18n.t('toasts.categoriesMerged'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
