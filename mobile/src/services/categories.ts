import api from './api';
import type { Category } from '@fin-health/shared/types';

export async function getCategories(): Promise<{ categories: Category[] }> {
  const { data } = await api.get('/categories');
  return data;
}

export async function updateCategory(id: string, body: { name?: string; icon?: string; color?: string }) {
  const { data } = await api.put(`/categories/${id}`, body);
  return data.category;
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}

export async function mergeCategory(id: string, targetCategoryId: string) {
  const { data } = await api.post(`/categories/${id}/merge`, { targetCategoryId });
  return data;
}

export async function getSubcategories(categoryId: string) {
  const { data } = await api.get(`/categories/${categoryId}/subcategories`);
  return data.subcategories;
}

export async function createSubcategory(categoryId: string, name: string) {
  const { data } = await api.post(`/categories/${categoryId}/subcategories`, { name });
  return data.subcategory;
}

export async function renameSubcategory(categoryId: string, subId: string, name: string) {
  const { data } = await api.put(`/categories/${categoryId}/subcategories/${subId}`, { name });
  return data.subcategory;
}

export async function deleteSubcategory(categoryId: string, subId: string) {
  await api.delete(`/categories/${categoryId}/subcategories/${subId}`);
}
