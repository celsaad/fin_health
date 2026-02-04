/**
 * Budgets router with month overview calculations
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas, monthKeyToRange, calculateMonthBudgetOverview, copyAllocationsForward, getPreviousMonthKey } from '@fin-health/domain';
import { budgets, budgetAllocations, expenses, categories, subcategories, users } from '@fin-health/db';
import { eq, and, gte, lt } from 'drizzle-orm';

export const budgetsRouter = router({
  /**
   * Get budget for a specific month with calculations
   */
  get: protectedProcedure
    .input(schemas.getMonthBudgetSchema)
    .query(async ({ input, ctx }) => {
      // Get user settings for timezone and month start day
      const [user] = await ctx.db
        .select({
          timezone: users.timezone,
          monthStartDay: users.monthStartDay,
        })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Find or create budget for the month
      let [budget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, ctx.userId), eq(budgets.monthKey, input.monthKey)))
        .limit(1);

      // If budget doesn't exist, create it
      if (!budget) {
        [budget] = await ctx.db
          .insert(budgets)
          .values({
            userId: ctx.userId,
            monthKey: input.monthKey,
          })
          .returning();

        if (!budget) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create budget',
          });
        }
      }

      // Get allocations for this budget
      const allAllocations = await ctx.db
        .select()
        .from(budgetAllocations)
        .where(eq(budgetAllocations.budgetId, budget.id));

      // Get date range for the month
      const range = monthKeyToRange(input.monthKey, user.timezone, user.monthStartDay);

      // Get expenses in this date range
      const monthExpenses = await ctx.db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, ctx.userId),
            gte(expenses.occurredAt, range.start),
            lt(expenses.occurredAt, range.end)
          )
        );

      // Get all categories and subcategories
      const userCategories = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.userId, ctx.userId));

      const userSubcategories = await ctx.db
        .select()
        .from(subcategories)
        .where(eq(subcategories.userId, ctx.userId));

      // Calculate month overview using domain logic
      const overview = calculateMonthBudgetOverview({
        budgetId: budget.id,
        monthKey: input.monthKey,
        allocations: allAllocations,
        expenses: monthExpenses,
        categories: userCategories,
        subcategories: userSubcategories,
      });

      return overview;
    }),

  /**
   * Create a budget for a month (optionally copy from previous)
   */
  create: protectedProcedure
    .input(schemas.createBudgetSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if budget already exists
      const [existingBudget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, ctx.userId), eq(budgets.monthKey, input.monthKey)))
        .limit(1);

      if (existingBudget) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Budget already exists for this month',
        });
      }

      // Create new budget
      const [newBudget] = await ctx.db
        .insert(budgets)
        .values({
          userId: ctx.userId,
          monthKey: input.monthKey,
        })
        .returning();

      if (!newBudget) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create budget',
        });
      }

      // Optionally copy from previous month
      if (input.copyFromPrevious) {
        const previousMonthKey = getPreviousMonthKey(input.monthKey);

        // Find previous month's budget
        const [previousBudget] = await ctx.db
          .select()
          .from(budgets)
          .where(and(eq(budgets.userId, ctx.userId), eq(budgets.monthKey, previousMonthKey)))
          .limit(1);

        if (previousBudget) {
          // Get previous allocations
          const previousAllocations = await ctx.db
            .select()
            .from(budgetAllocations)
            .where(eq(budgetAllocations.budgetId, previousBudget.id));

          // Copy allocations to new budget
          const newAllocations = copyAllocationsForward({
            sourceAllocations: previousAllocations,
            targetBudgetId: newBudget.id,
          });

          if (newAllocations.length > 0) {
            await ctx.db.insert(budgetAllocations).values(newAllocations);
          }
        }
      }

      return newBudget;
    }),

  /**
   * Update all allocations for a budget
   */
  updateAllocations: protectedProcedure
    .input(schemas.updateBudgetAllocationsSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify budget belongs to user
      const [budget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, input.budgetId), eq(budgets.userId, ctx.userId)))
        .limit(1);

      if (!budget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Budget not found',
        });
      }

      // Delete existing allocations
      await ctx.db
        .delete(budgetAllocations)
        .where(eq(budgetAllocations.budgetId, input.budgetId));

      // Insert new allocations
      if (input.allocations.length > 0) {
        await ctx.db.insert(budgetAllocations).values(
          input.allocations.map((alloc) => ({
            budgetId: input.budgetId,
            categoryId: alloc.categoryId,
            subcategoryId: alloc.subcategoryId,
            amountCents: alloc.amountCents,
          }))
        );
      }

      // Return updated allocations
      const updatedAllocations = await ctx.db
        .select()
        .from(budgetAllocations)
        .where(eq(budgetAllocations.budgetId, input.budgetId));

      return updatedAllocations;
    }),

  /**
   * Copy allocations from one month to another
   */
  copyMonth: protectedProcedure
    .input(schemas.copyMonthBudgetSchema)
    .mutation(async ({ input, ctx }) => {
      // Find source budget
      const [sourceBudget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, ctx.userId), eq(budgets.monthKey, input.sourceMonthKey)))
        .limit(1);

      if (!sourceBudget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source budget not found',
        });
      }

      // Get source allocations
      const sourceAllocations = await ctx.db
        .select()
        .from(budgetAllocations)
        .where(eq(budgetAllocations.budgetId, sourceBudget.id));

      // Find or create target budget
      let [targetBudget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, ctx.userId), eq(budgets.monthKey, input.targetMonthKey)))
        .limit(1);

      if (!targetBudget) {
        [targetBudget] = await ctx.db
          .insert(budgets)
          .values({
            userId: ctx.userId,
            monthKey: input.targetMonthKey,
          })
          .returning();
      }

      if (!targetBudget) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create target budget',
        });
      }

      // Delete existing target allocations
      await ctx.db
        .delete(budgetAllocations)
        .where(eq(budgetAllocations.budgetId, targetBudget.id));

      // Copy allocations
      const newAllocations = copyAllocationsForward({
        sourceAllocations,
        targetBudgetId: targetBudget.id,
      });

      if (newAllocations.length > 0) {
        await ctx.db.insert(budgetAllocations).values(newAllocations);
      }

      return targetBudget;
    }),
});
