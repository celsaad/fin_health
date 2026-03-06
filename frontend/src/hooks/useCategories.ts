import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { parseError } from '@/lib/api';
import { toast } from 'sonner';
import type { Category, Subcategory } from '@fin-health/shared/types';

export type { Category, Subcategory };

interface CategoriesResponse {
  categories: Category[];
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoriesResponse>('/categories');
      return data.categories;
    },
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, name }: { categoryId: string; name: string }) => {
      const { data } = await api.post(`/categories/${categoryId}/subcategories`, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory created successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await api.put(`/categories/${id}`, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category renamed successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useRenameSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      subcategoryId,
      name,
    }: {
      categoryId: string;
      subcategoryId: string;
      name: string;
    }) => {
      const { data } = await api.put(`/categories/${categoryId}/subcategories/${subcategoryId}`, {
        name,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory renamed successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      subcategoryId,
    }: {
      categoryId: string;
      subcategoryId: string;
    }) => {
      await api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useUpdateCategoryAppearance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, icon, color }: { id: string; icon?: string; color?: string }) => {
      const { data } = await api.put(`/categories/${id}`, { icon, color });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}

export function useMergeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      targetCategoryId,
    }: {
      sourceId: string;
      targetCategoryId: string;
    }) => {
      const { data } = await api.post(`/categories/${sourceId}/merge`, {
        targetCategoryId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Categories merged successfully');
    },
    onError: (error: unknown) => {
      toast.error(parseError(error).message);
    },
  });
}
