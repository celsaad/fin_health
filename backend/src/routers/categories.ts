import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import prisma from '../lib/prisma';
import { router, protectedProcedure } from '../trpc';
import {
  updateCategorySchema,
  mergeCategorySchema,
  createSubcategorySchema,
  renameSubcategorySchema,
} from '../validators/category';

export const categoriesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const categories = await prisma.category.findMany({
      where: { userId: ctx.userId },
      include: {
        subcategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
        _count: { select: { transactions: { where: { deletedAt: null } } } },
      },
      orderBy: { name: 'asc' },
    });
    return { categories };
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(updateCategorySchema))
    .mutation(async ({ ctx, input }) => {
      const { id, name, icon, color } = input;

      const category = await prisma.category.findFirst({ where: { id, userId: ctx.userId } });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      if (name) {
        const duplicate = await prisma.category.findUnique({
          where: { userId_name_type: { userId: ctx.userId, name, type: category.type } },
        });
        if (duplicate && duplicate.id !== id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'A category with this name already exists' });
        }
      }

      const data: { name?: string; icon?: string; color?: string } = {};
      if (name !== undefined) data.name = name;
      if (icon !== undefined) data.icon = icon;
      if (color !== undefined) data.color = color;

      const updated = await prisma.category.update({ where: { id }, data });
      return { category: updated };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await prisma.category.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { _count: { select: { transactions: true } } },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      if (category._count.transactions > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with existing transactions. Merge it into another category instead.',
        });
      }

      await prisma.category.delete({ where: { id: input.id } });
      return { message: 'Category deleted' };
    }),

  merge: protectedProcedure
    .input(z.object({ id: z.string() }).merge(mergeCategorySchema))
    .mutation(async ({ ctx, input }) => {
      const { id: sourceId, targetCategoryId } = input;

      if (sourceId === targetCategoryId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot merge a category into itself' });
      }

      const [source, target] = await Promise.all([
        prisma.category.findFirst({ where: { id: sourceId, userId: ctx.userId } }),
        prisma.category.findFirst({ where: { id: targetCategoryId, userId: ctx.userId } }),
      ]);
      if (!source) throw new TRPCError({ code: 'NOT_FOUND', message: 'Source category not found' });
      if (!target) throw new TRPCError({ code: 'NOT_FOUND', message: 'Target category not found' });

      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { categoryId: sourceId, userId: ctx.userId },
          data: { categoryId: targetCategoryId, subcategoryId: null },
        }),
        prisma.recurringTransaction.updateMany({
          where: { categoryId: sourceId, userId: ctx.userId },
          data: { categoryId: targetCategoryId, subcategoryId: null },
        }),
        prisma.budget.updateMany({
          where: { categoryId: sourceId, userId: ctx.userId },
          data: { categoryId: targetCategoryId },
        }),
        prisma.subcategory.deleteMany({ where: { categoryId: sourceId } }),
        prisma.category.delete({ where: { id: sourceId } }),
      ]);

      return { message: 'Category merged successfully' };
    }),

  listSubcategories: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId: ctx.userId },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const subcategories = await prisma.subcategory.findMany({
        where: { categoryId: input.categoryId },
        orderBy: { name: 'asc' },
      });
      return { subcategories };
    }),

  createSubcategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }).merge(createSubcategorySchema))
    .mutation(async ({ ctx, input }) => {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId: ctx.userId },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const subcategory = await prisma.subcategory.create({
        data: { name: input.name, categoryId: input.categoryId },
      });
      return { subcategory };
    }),

  renameSubcategory: protectedProcedure
    .input(
      z.object({ categoryId: z.string(), subcategoryId: z.string() }).merge(renameSubcategorySchema),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId: ctx.userId },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const sub = await prisma.subcategory.findFirst({
        where: { id: input.subcategoryId, categoryId: input.categoryId },
      });
      if (!sub) throw new TRPCError({ code: 'NOT_FOUND', message: 'Subcategory not found' });

      const updated = await prisma.subcategory.update({
        where: { id: input.subcategoryId },
        data: { name: input.name },
      });
      return { subcategory: updated };
    }),

  deleteSubcategory: protectedProcedure
    .input(z.object({ categoryId: z.string(), subcategoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId: ctx.userId },
      });
      if (!category) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const sub = await prisma.subcategory.findFirst({
        where: { id: input.subcategoryId, categoryId: input.categoryId },
        include: { _count: { select: { transactions: true } } },
      });
      if (!sub) throw new TRPCError({ code: 'NOT_FOUND', message: 'Subcategory not found' });

      if (sub._count.transactions > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete subcategory with existing transactions',
        });
      }

      await prisma.subcategory.delete({ where: { id: input.subcategoryId } });
      return { message: 'Subcategory deleted' };
    }),
});
