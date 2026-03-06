import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  subcategories: Subcategory[];
  _count: {
    transactions: number;
  };
}

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
    mutationFn: async ({
      categoryId,
      name,
    }: {
      categoryId: string;
      name: string;
    }) => {
      const { data } = await api.post(
        `/categories/${categoryId}/subcategories`,
        { name }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create subcategory');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rename category');
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
      const { data } = await api.put(
        `/categories/${categoryId}/subcategories/${subcategoryId}`,
        { name }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rename subcategory');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
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
      await api.delete(
        `/categories/${categoryId}/subcategories/${subcategoryId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Subcategory deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subcategory');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to merge categories');
    },
  });
}
