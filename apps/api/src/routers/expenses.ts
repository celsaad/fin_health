/**
 * Expenses router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas, monthKeyToRange } from '@fin-health/domain';

export const expensesRouter = router({
  /**
   * List expenses with optional filtering
   */
  list: protectedProcedure
    .input(schemas.listExpensesSchema)
    .query(async ({ input, ctx }) => {
      const where: any = {
        userId: ctx.userId,
      };

      // Filter by month if provided
      if (input.monthKey) {
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

        const range = monthKeyToRange(input.monthKey, user.timezone, user.monthStartDay);
        where.occurredAt = {
          gte: range.start,
          lt: range.end,
        };
      }

      // Filter by category if provided
      if (input.categoryId) {
        where.categoryId = input.categoryId;
      }

      // Apply pagination
      const limit = input.limit ?? 50;
      const offset = input.offset ?? 0;

      const results = await ctx.db.expense.findMany({
        where,
        orderBy: {
          occurredAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return results;
    }),

  /**
   * Create a new expense
   */
  create: protectedProcedure
    .input(schemas.createExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const newExpense = await ctx.db.expense.create({
        data: {
          userId: ctx.userId,
          occurredAt: input.occurredAt,
          amountCents: input.amountCents,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId,
          notes: input.notes ?? null,
        },
      });

      return newExpense;
    }),

  /**
   * Update an expense
   */
  update: protectedProcedure
    .input(schemas.updateExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const updatedExpense = await ctx.db.expense.updateMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          ...(input.occurredAt !== undefined && { occurredAt: input.occurredAt }),
          ...(input.amountCents !== undefined && { amountCents: input.amountCents }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.subcategoryId !== undefined && { subcategoryId: input.subcategoryId }),
          ...(input.notes !== undefined && { notes: input.notes }),
        },
      });

      if (updatedExpense.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      // Fetch and return the updated expense
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
      });

      return expense!;
    }),

  /**
   * Delete an expense
   */
  delete: protectedProcedure
    .input(schemas.deleteExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const deletedExpense = await ctx.db.expense.deleteMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (deletedExpense.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return { success: true };
    }),
});
