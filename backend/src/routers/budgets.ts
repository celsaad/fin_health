import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../lib/prisma';
import { router, protectedProcedure } from '../trpc';
import { upsertBudgetSchema, copyBudgetsSchema } from '../validators/budget';
import { getBudgetsWithSpent } from '../services/budgetService';

function serializeBudget<
  T extends { amount: { toString(): string }; spent: string; remaining: string },
>(b: T) {
  return {
    ...b,
    amount: Number(b.amount),
    spent: Number(b.spent),
    remaining: Number(b.remaining),
  };
}

export const budgetsRouter = router({
  list: protectedProcedure
    .input(z.object({ month: z.number().int().min(1).max(12), year: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const budgets = await getBudgetsWithSpent(ctx.userId, input.month, input.year);
      return { budgets: budgets.map(serializeBudget) };
    }),

  upsert: protectedProcedure.input(upsertBudgetSchema).mutation(async ({ ctx, input }) => {
    const { amount, categoryId, isRecurring } = input;
    const effectiveCategoryId = categoryId ?? null;
    const effectiveMonth = isRecurring ? 0 : (input.month ?? 0);
    const effectiveYear = isRecurring ? 0 : (input.year ?? 0);

    if (effectiveCategoryId) {
      const category = await prisma.category.findFirst({
        where: { id: effectiveCategoryId, userId: ctx.userId },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: ctx.userId,
          categoryId: effectiveCategoryId ?? '',
          month: effectiveMonth,
          year: effectiveYear,
        },
      },
      update: { amount, isRecurring: !!isRecurring },
      create: {
        amount,
        month: effectiveMonth,
        year: effectiveYear,
        isRecurring: !!isRecurring,
        categoryId: effectiveCategoryId,
        userId: ctx.userId,
      },
    });

    return { budget: { ...budget, amount: Number(budget.amount) } };
  }),

  copyPrevious: protectedProcedure.input(copyBudgetsSchema).mutation(async ({ ctx, input }) => {
    const { month, year } = input;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const previousBudgets = await prisma.budget.findMany({
      where: { userId: ctx.userId, month: prevMonth, year: prevYear, isRecurring: false },
    });

    let copied = 0;
    const budgets = [];

    for (const prev of previousBudgets) {
      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId: ctx.userId,
            categoryId: prev.categoryId ?? '',
            month,
            year,
          },
        },
        update: {},
        create: {
          amount: prev.amount,
          month,
          year,
          isRecurring: false,
          categoryId: prev.categoryId,
          userId: ctx.userId,
        },
      });
      if (budget.createdAt.getTime() === budget.updatedAt.getTime()) copied++;
      budgets.push({ ...budget, amount: Number(budget.amount) });
    }

    return { budgets, copied };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const budget = await prisma.budget.findFirst({ where: { id: input.id, userId: ctx.userId } });
      if (!budget) throw new TRPCError({ code: 'NOT_FOUND', message: 'Budget not found' });

      await prisma.budget.delete({ where: { id: input.id } });
      return { message: 'Budget deleted' };
    }),
});
