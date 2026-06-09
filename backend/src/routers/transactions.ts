import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { router, protectedProcedure } from '../trpc';
import {
  createTransactionSchema,
  updateTransactionSchema,
  bulkDeleteSchema,
} from '../validators/transaction';
import { resolveCategory } from '../services/categoryResolver';
import { toUsd } from '../services/exchangeRate';

function serializeTransaction<
  T extends {
    amount: { toString(): string };
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  },
>(t: T) {
  return {
    ...t,
    amount: Number(t.amount),
    date: t.date.toISOString().split('T')[0],
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    deletedAt: t.deletedAt?.toISOString() ?? null,
  };
}

const categorySelect = { id: true, name: true, type: true, icon: true, color: true } as const;
const subcategorySelect = { id: true, name: true } as const;

const listInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  type: z.enum(['expense', 'income']).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const transactionsRouter = router({
  list: protectedProcedure.input(listInput).query(async ({ ctx, input }) => {
    const {
      page,
      limit,
      type,
      categoryId,
      subcategoryId,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
    } = input;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId: ctx.userId, deletedAt: null };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate)
        (where.date as Prisma.DateTimeFilter).gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) (where.date as Prisma.DateTimeFilter).lte = new Date(endDate + 'T23:59:59.999Z');
    }
    if (search) where.description = { contains: search, mode: 'insensitive' };

    const orderField = sortBy ?? 'date';
    const orderDir = sortOrder ?? 'desc';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: categorySelect },
          subcategory: { select: subcategorySelect },
        },
        orderBy: { [orderField]: orderDir },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map(serializeTransaction),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const transaction = await prisma.transaction.findFirst({
      where: { id: input.id, userId: ctx.userId, deletedAt: null },
      include: {
        category: { select: categorySelect },
        subcategory: { select: subcategorySelect },
      },
    });
    if (!transaction) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });
    return { transaction: serializeTransaction(transaction) };
  }),

  create: protectedProcedure.input(createTransactionSchema).mutation(async ({ ctx, input }) => {
    const {
      amount,
      currency = 'USD',
      type,
      description,
      date,
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

    const rawAmount = parseFloat(amount);
    const { amountUsd, exchangeRate } = await toUsd(rawAmount, currency.toUpperCase());

    const transaction = await prisma.transaction.create({
      data: {
        amount: rawAmount,
        currency: currency.toUpperCase(),
        amountUsd,
        exchangeRate,
        type,
        description,
        date: new Date(date + 'T12:00:00.000Z'),
        notes: notes ?? null,
        categoryId,
        subcategoryId: subcategoryId ?? null,
        userId: ctx.userId,
      },
      include: {
        category: { select: categorySelect },
        subcategory: { select: subcategorySelect },
      },
    });

    return { transaction: serializeTransaction(transaction) };
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(updateTransactionSchema))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        amount,
        currency,
        type,
        description,
        date,
        categoryName,
        subcategoryName,
        notes,
      } = input;

      const existing = await prisma.transaction.findFirst({
        where: { id, userId: ctx.userId, deletedAt: null },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });

      const updateData: Prisma.TransactionUpdateInput = {};

      if (amount !== undefined || currency !== undefined) {
        const newAmount =
          amount !== undefined ? parseFloat(amount) : parseFloat(existing.amount.toString());
        const newCurrency = currency !== undefined ? currency.toUpperCase() : existing.currency;
        const { amountUsd, exchangeRate } = await toUsd(newAmount, newCurrency);
        if (amount !== undefined) updateData.amount = newAmount;
        updateData.currency = newCurrency;
        updateData.amountUsd = amountUsd;
        updateData.exchangeRate = exchangeRate;
      }

      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date + 'T12:00:00.000Z');
      if (notes !== undefined) updateData.notes = notes;

      if (categoryName) {
        const effectiveType = type ?? existing.type;
        const { categoryId, subcategoryId } = await resolveCategory(
          ctx.userId,
          categoryName,
          effectiveType,
          subcategoryName ?? undefined,
        );
        updateData.category = { connect: { id: categoryId } };
        if (subcategoryId) {
          updateData.subcategory = { connect: { id: subcategoryId } };
        } else if (subcategoryName === null) {
          updateData.subcategory = { disconnect: true };
        }
      } else if (subcategoryName === null) {
        updateData.subcategory = { disconnect: true };
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: categorySelect },
          subcategory: { select: subcategorySelect },
        },
      });

      return { transaction: serializeTransaction(transaction) };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.transaction.findFirst({
        where: { id: input.id, userId: ctx.userId, deletedAt: null },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });

      await prisma.transaction.update({ where: { id: input.id }, data: { deletedAt: new Date() } });
      return { message: 'Transaction deleted' };
    }),

  bulkDelete: protectedProcedure.input(bulkDeleteSchema).mutation(async ({ ctx, input }) => {
    const result = await prisma.transaction.updateMany({
      where: { id: { in: input.ids }, userId: ctx.userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { deleted: result.count };
  }),
});
