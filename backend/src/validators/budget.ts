import { z } from 'zod';

export const upsertBudgetSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  categoryId: z.string().nullable().optional(),
});

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
