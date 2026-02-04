/**
 * Expenses router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas, monthKeyToRange } from '@fin-health/domain';
import { expenses, users } from '@fin-health/db';
import { eq, and, gte, lt, desc } from 'drizzle-orm';

export const expensesRouter = router({
  /**
   * List expenses with optional filtering
   */
  list: protectedProcedure
    .input(schemas.listExpensesSchema)
    .query(async ({ input, ctx }) => {
      let query = ctx.db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, ctx.userId))
        .orderBy(desc(expenses.occurredAt));

      // Filter by month if provided
      if (input.monthKey) {
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

        const range = monthKeyToRange(input.monthKey, user.timezone, user.monthStartDay);
        query = ctx.db
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.userId, ctx.userId),
              gte(expenses.occurredAt, range.start),
              lt(expenses.occurredAt, range.end)
            )
          )
          .orderBy(desc(expenses.occurredAt));
      }

      // Filter by category if provided
      if (input.categoryId) {
        const conditions = [eq(expenses.userId, ctx.userId), eq(expenses.categoryId, input.categoryId)];

        if (input.monthKey) {
          const [user] = await ctx.db
            .select({
              timezone: users.timezone,
              monthStartDay: users.monthStartDay,
            })
            .from(users)
            .where(eq(users.id, ctx.userId))
            .limit(1);

          if (user) {
            const range = monthKeyToRange(input.monthKey, user.timezone, user.monthStartDay);
            conditions.push(gte(expenses.occurredAt, range.start));
            conditions.push(lt(expenses.occurredAt, range.end));
          }
        }

        query = ctx.db
          .select()
          .from(expenses)
          .where(and(...conditions))
          .orderBy(desc(expenses.occurredAt));
      }

      // Apply pagination
      const limit = input.limit ?? 50;
      const offset = input.offset ?? 0;

      const results = await query.limit(limit).offset(offset);

      return results;
    }),

  /**
   * Create a new expense
   */
  create: protectedProcedure
    .input(schemas.createExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const [newExpense] = await ctx.db
        .insert(expenses)
        .values({
          userId: ctx.userId,
          occurredAt: input.occurredAt,
          amountCents: input.amountCents,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId,
          notes: input.notes ?? null,
        })
        .returning();

      if (!newExpense) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create expense',
        });
      }

      return newExpense;
    }),

  /**
   * Update an expense
   */
  update: protectedProcedure
    .input(schemas.updateExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.occurredAt !== undefined) {
        updateData.occurredAt = input.occurredAt;
      }
      if (input.amountCents !== undefined) {
        updateData.amountCents = input.amountCents;
      }
      if (input.categoryId !== undefined) {
        updateData.categoryId = input.categoryId;
      }
      if (input.subcategoryId !== undefined) {
        updateData.subcategoryId = input.subcategoryId;
      }
      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      const [updatedExpense] = await ctx.db
        .update(expenses)
        .set(updateData)
        .where(and(eq(expenses.id, input.id), eq(expenses.userId, ctx.userId)))
        .returning();

      if (!updatedExpense) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return updatedExpense;
    }),

  /**
   * Delete an expense
   */
  delete: protectedProcedure
    .input(schemas.deleteExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const [deletedExpense] = await ctx.db
        .delete(expenses)
        .where(and(eq(expenses.id, input.id), eq(expenses.userId, ctx.userId)))
        .returning();

      if (!deletedExpense) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return { success: true };
    }),
});
