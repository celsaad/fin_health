import { z } from 'zod';

export const renameCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
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

export type RenameCategoryInput = z.infer<typeof renameCategorySchema>;
export type MergeCategoryInput = z.infer<typeof mergeCategorySchema>;
