import { trpcClient } from '../lib/trpc';

export async function getCategories() {
  return trpcClient.categories.list.query();
}

export async function updateCategory(
  id: string,
  body: { name?: string; icon?: string; color?: string },
) {
  const result = await trpcClient.categories.update.mutate({ id, ...body });
  return result.category;
}

export async function deleteCategory(id: string) {
  return trpcClient.categories.delete.mutate({ id });
}

export async function mergeCategory(id: string, targetCategoryId: string) {
  return trpcClient.categories.merge.mutate({ id, targetCategoryId });
}

export async function getSubcategories(categoryId: string) {
  const result = await trpcClient.categories.listSubcategories.query({ categoryId });
  return result.subcategories;
}

export async function createSubcategory(categoryId: string, name: string) {
  const result = await trpcClient.categories.createSubcategory.mutate({ categoryId, name });
  return result.subcategory;
}

export async function renameSubcategory(categoryId: string, subcategoryId: string, name: string) {
  const result = await trpcClient.categories.renameSubcategory.mutate({
    categoryId,
    subcategoryId,
    name,
  });
  return result.subcategory;
}

export async function deleteSubcategory(categoryId: string, subcategoryId: string) {
  return trpcClient.categories.deleteSubcategory.mutate({ categoryId, subcategoryId });
}
