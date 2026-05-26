import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../lib/prisma';
import { router, protectedProcedure } from '../trpc';
import { createRecurringSchema, updateRecurringSchema } from '../validators/recurring';
import { resolveCategory } from '../services/categoryResolver';

const includeRelations = {
  category: { select: { id: true, name: true, type: true, icon: true, color: true } },
  subcategory: { select: { id: true, name: true } },
} as const;

function serializeRecurring<
  T extends { amount: { toString(): string }; startDate: Date; endDate: Date | null },
>(t: T) {
  return {
    ...t,
    amount: Number(t.amount),
    startDate: t.startDate.toISOString().split('T')[0],
    endDate: t.endDate?.toISOString().split('T')[0] ?? null,
  };
}

export const recurringRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await prisma.recurringTransaction.findMany({
      where: { userId: ctx.userId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return { recurringTransactions: templates.map(serializeRecurring) };
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const template = await prisma.recurringTransaction.findFirst({
      where: { id: input.id, userId: ctx.userId },
      include: includeRelations,
    });
    if (!template)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Recurring transaction not found' });
    return { recurringTransaction: serializeRecurring(template) };
  }),

  create: protectedProcedure.input(createRecurringSchema).mutation(async ({ ctx, input }) => {
    const {
      amount,
      type,
      description,
      frequency,
      startDate,
      endDate,
      categoryName,
      subcategoryName,
      notes,
    } = input;

    const { categoryId, subcategoryId } = await resolveCategory(
      ctx.userId,
      categoryName,
      type,
      subcategoryName,
    );

    const template = await prisma.recurringTransaction.create({
      data: {
        amount,
        type,
        description,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes ?? null,
        categoryId,
        subcategoryId: subcategoryId ?? null,
        userId: ctx.userId,
      },
      include: includeRelations,
    });

    return { recurringTransaction: serializeRecurring(template) };
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(updateRecurringSchema))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        amount,
        type,
        description,
        frequency,
        startDate,
        endDate,
        categoryName,
        subcategoryName,
        notes,
      } = input;

      const existing = await prisma.recurringTransaction.findFirst({
        where: { id, userId: ctx.userId },
      });
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recurring transaction not found' });

      const updateData: Record<string, unknown> = {};
      if (amount !== undefined) updateData.amount = amount;
      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (notes !== undefined) updateData.notes = notes;

      if (categoryName) {
        const effectiveType = type ?? existing.type;
        const resolved = await resolveCategory(
          ctx.userId,
          categoryName,
          effectiveType,
          subcategoryName ?? undefined,
        );
        updateData.categoryId = resolved.categoryId;
        updateData.subcategoryId = resolved.subcategoryId ?? null;
      } else if (subcategoryName === null) {
        updateData.subcategoryId = null;
      }

      const template = await prisma.recurringTransaction.update({
        where: { id },
        data: updateData,
        include: includeRelations,
      });

      return { recurringTransaction: serializeRecurring(template) };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.recurringTransaction.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recurring transaction not found' });

      await prisma.recurringTransaction.delete({ where: { id: input.id } });
      return { message: 'Recurring transaction deleted' };
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.recurringTransaction.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!existing)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recurring transaction not found' });

      const template = await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: { isActive: !existing.isActive },
        include: includeRelations,
      });

      return { recurringTransaction: serializeRecurring(template) };
    }),
});
