/**
 * Zod schemas for API validation
 * All inputs/outputs are validated by these schemas
 */

import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
  }),
});

// ============================================================================
// User Settings Schemas
// ============================================================================

export const userSettingsSchema = z.object({
  currency: z.string().length(3), // ISO 4217 currency code
  timezone: z.string(), // IANA timezone
  monthStartDay: z.number().int().min(1).max(31),
});

export const updateSettingsSchema = userSettingsSchema.partial();

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  currency: z.string(),
  timezone: z.string(),
  monthStartDay: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Category Schemas
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  archived: z.boolean().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Subcategory Schemas
// ============================================================================

export const createSubcategorySchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateSubcategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  archived: z.boolean().optional(),
});

export const subcategorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  archived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const categoryWithSubcategoriesSchema = categorySchema.extend({
  subcategories: z.array(subcategorySchema),
});

// ============================================================================
// Budget Schemas
// ============================================================================

export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}$/, 'Invalid monthKey format');

export const createBudgetSchema = z.object({
  monthKey: monthKeySchema,
  copyFromPrevious: z.boolean().optional(),
});

export const budgetAllocationInputSchema = z.object({
  categoryId: z.string(),
  subcategoryId: z.string().nullable(),
  amountCents: z.number().int(),
});

export const updateBudgetAllocationsSchema = z.object({
  budgetId: z.string(),
  allocations: z.array(budgetAllocationInputSchema),
});

export const budgetAllocationSchema = z.object({
  id: z.string(),
  budgetId: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable(),
  amountCents: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const budgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  monthKey: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getMonthBudgetSchema = z.object({
  monthKey: monthKeySchema,
});

export const copyMonthBudgetSchema = z.object({
  sourceMonthKey: monthKeySchema,
  targetMonthKey: monthKeySchema,
});

// ============================================================================
// Expense Schemas
// ============================================================================

export const createExpenseSchema = z.object({
  occurredAt: z.date(),
  amountCents: z.number().int().positive(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateExpenseSchema = z.object({
  id: z.string(),
  occurredAt: z.date().optional(),
  amountCents: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const deleteExpenseSchema = z.object({
  id: z.string(),
});

export const listExpensesSchema = z.object({
  monthKey: monthKeySchema.optional(),
  categoryId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  occurredAt: z.date(),
  amountCents: z.number(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Budget Overview Schemas (computed/view types)
// ============================================================================

export const subcategoryBudgetSummarySchema = z.object({
  subcategoryId: z.string(),
  subcategoryName: z.string(),
  allocatedCents: z.number(),
  spentCents: z.number(),
  remainingCents: z.number(),
  percentageSpent: z.number(),
});

export const categoryBudgetSummarySchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  allocatedCents: z.number(),
  spentCents: z.number(),
  remainingCents: z.number(),
  percentageSpent: z.number(),
  subcategories: z.array(subcategoryBudgetSummarySchema),
});

export const monthBudgetOverviewSchema = z.object({
  monthKey: z.string(),
  budgetId: z.string().nullable(),
  totalAllocatedCents: z.number(),
  totalSpentCents: z.number(),
  totalRemainingCents: z.number(),
  percentageSpent: z.number(),
  categories: z.array(categoryBudgetSummarySchema),
});

// ============================================================================
// Inferred Types (for convenience)
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type BudgetAllocationInput = z.infer<typeof budgetAllocationInputSchema>;
export type UpdateBudgetAllocationsInput = z.infer<typeof updateBudgetAllocationsSchema>;
export type GetMonthBudgetInput = z.infer<typeof getMonthBudgetSchema>;
export type CopyMonthBudgetInput = z.infer<typeof copyMonthBudgetSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type ListExpensesInput = z.infer<typeof listExpensesSchema>;
