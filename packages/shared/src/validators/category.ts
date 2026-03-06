import { z } from 'zod';

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
});

export const mergeCategorySchema = z.object({
  targetCategoryId: z.string().min(1, 'Target category ID is required'),
});

export const createSubcategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const renameSubcategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type MergeCategoryInput = z.infer<typeof mergeCategorySchema>;
