import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  type: z.enum(['expense', 'income']),
  description: z.string().min(1, 'Description is required').max(255),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  categoryName: z.string().min(1, 'Category name is required').max(100),
  subcategoryName: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateTransactionSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    })
    .optional(),
  type: z.enum(['expense', 'income']).optional(),
  description: z.string().min(1).max(255).optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional(),
  categoryName: z.string().min(1).max(100).optional(),
  subcategoryName: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const queryTransactionSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(['expense', 'income']).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one id is required').max(200, 'Cannot delete more than 200 at once'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type QueryTransactionInput = z.infer<typeof queryTransactionSchema>;
