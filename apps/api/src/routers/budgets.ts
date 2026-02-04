/**
 * Budgets router with month overview calculations
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import {
  schemas,
  monthKeyToRange,
  calculateMonthBudgetOverview,
  copyAllocationsForward,
  getPreviousMonthKey,
} from '@fin-health/domain';

export const budgetsRouter = router({
  /**
   * Get budget for a specific month with calculations
   */
  get: protectedProcedure
    .input(schemas.getMonthBudgetSchema)
    .query(async ({ input, ctx }) => {
      // Get user settings for timezone and month start day
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: {
          timezone: true,
          monthStartDay: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Find or create budget for the month
      let budget = await ctx.db.budget.findFirst({
        where: {
          userId: ctx.userId,
          monthKey: input.monthKey,
        },
      });

      // If budget doesn't exist, create it
      if (!budget) {
        budget = await ctx.db.budget.create({
          data: {
            userId: ctx.userId,
            monthKey: input.monthKey,
          },
        });
      }

      // Get allocations for this budget
      const allAllocations = await ctx.db.budgetAllocation.findMany({
        where: {
          budgetId: budget.id,
        },
      });

      // Get date range for the month
      const range = monthKeyToRange(input.monthKey, user.timezone, user.monthStartDay);

      // Get expenses in this date range
      const monthExpenses = await ctx.db.expense.findMany({
        where: {
          userId: ctx.userId,
          occurredAt: {
            gte: range.start,
            lt: range.end,
          },
        },
      });

      // Get all categories and subcategories
      const userCategories = await ctx.db.category.findMany({
        where: {
          userId: ctx.userId,
        },
      });

      const userSubcategories = await ctx.db.subcategory.findMany({
        where: {
          userId: ctx.userId,
        },
      });

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
      const existingBudget = await ctx.db.budget.findFirst({
        where: {
          userId: ctx.userId,
          monthKey: input.monthKey,
        },
      });

      if (existingBudget) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Budget already exists for this month',
        });
      }

      // Create new budget
      const newBudget = await ctx.db.budget.create({
        data: {
          userId: ctx.userId,
          monthKey: input.monthKey,
        },
      });

      // Optionally copy from previous month
      if (input.copyFromPrevious) {
        const previousMonthKey = getPreviousMonthKey(input.monthKey);

        // Find previous month's budget
        const previousBudget = await ctx.db.budget.findFirst({
          where: {
            userId: ctx.userId,
            monthKey: previousMonthKey,
          },
        });

        if (previousBudget) {
          // Get previous allocations
          const previousAllocations = await ctx.db.budgetAllocation.findMany({
            where: {
              budgetId: previousBudget.id,
            },
          });

          // Copy allocations to new budget
          const newAllocations = copyAllocationsForward({
            sourceAllocations: previousAllocations,
            targetBudgetId: newBudget.id,
          });

          if (newAllocations.length > 0) {
            await ctx.db.budgetAllocation.createMany({
              data: newAllocations,
            });
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
      const budget = await ctx.db.budget.findFirst({
        where: {
          id: input.budgetId,
          userId: ctx.userId,
        },
      });

      if (!budget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Budget not found',
        });
      }

      // Delete existing allocations
      await ctx.db.budgetAllocation.deleteMany({
        where: {
          budgetId: input.budgetId,
        },
      });

      // Insert new allocations
      if (input.allocations.length > 0) {
        await ctx.db.budgetAllocation.createMany({
          data: input.allocations.map((alloc) => ({
            budgetId: input.budgetId,
            categoryId: alloc.categoryId,
            subcategoryId: alloc.subcategoryId,
            amountCents: alloc.amountCents,
          })),
        });
      }

      // Return updated allocations
      const updatedAllocations = await ctx.db.budgetAllocation.findMany({
        where: {
          budgetId: input.budgetId,
        },
      });

      return updatedAllocations;
    }),

  /**
   * Copy allocations from one month to another
   */
  copyMonth: protectedProcedure
    .input(schemas.copyMonthBudgetSchema)
    .mutation(async ({ input, ctx }) => {
      // Find source budget
      const sourceBudget = await ctx.db.budget.findFirst({
        where: {
          userId: ctx.userId,
          monthKey: input.sourceMonthKey,
        },
      });

      if (!sourceBudget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source budget not found',
        });
      }

      // Get source allocations
      const sourceAllocations = await ctx.db.budgetAllocation.findMany({
        where: {
          budgetId: sourceBudget.id,
        },
      });

      // Find or create target budget
      let targetBudget = await ctx.db.budget.findFirst({
        where: {
          userId: ctx.userId,
          monthKey: input.targetMonthKey,
        },
      });

      if (!targetBudget) {
        targetBudget = await ctx.db.budget.create({
          data: {
            userId: ctx.userId,
            monthKey: input.targetMonthKey,
          },
        });
      }

      // Delete existing target allocations
      await ctx.db.budgetAllocation.deleteMany({
        where: {
          budgetId: targetBudget.id,
        },
      });

      // Copy allocations
      const newAllocations = copyAllocationsForward({
        sourceAllocations,
        targetBudgetId: targetBudget.id,
      });

      if (newAllocations.length > 0) {
        await ctx.db.budgetAllocation.createMany({
          data: newAllocations,
        });
      }

      return targetBudget;
    }),
});
