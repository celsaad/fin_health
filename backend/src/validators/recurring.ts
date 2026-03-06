import { z } from 'zod';

export const createRecurringSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  type: z.enum(['expense', 'income']),
  description: z.string().min(1, 'Description is required').max(255),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional()
    .nullable(),
  categoryName: z.string().min(1, 'Category name is required').max(100),
  subcategoryName: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRecurringSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    })
    .optional(),
  type: z.enum(['expense', 'income']).optional(),
  description: z.string().min(1).max(255).optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional()
    .nullable(),
  categoryName: z.string().min(1).max(100).optional(),
  subcategoryName: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
