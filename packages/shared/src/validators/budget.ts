import { z } from 'zod';

export const upsertBudgetSchema = z
  .object({
    amount: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Amount must be a positive number',
      }),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    categoryId: z.string().nullable().optional(),
    isRecurring: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isRecurring) return true;
      return data.month !== undefined && data.year !== undefined;
    },
    { message: 'Month and year are required for non-recurring budgets' },
  );

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;

export const copyBudgetsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});
