/**
 * Categories and subcategories router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas } from '@fin-health/domain';

export const categoriesRouter = router({
  /**
   * List all categories with their subcategories
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all categories for the user with their subcategories
    const userCategories = await ctx.db.category.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        subcategories: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return userCategories;
  }),

  /**
   * Create a new category
   */
  create: protectedProcedure
    .input(schemas.createCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const newCategory = await ctx.db.category.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          sortOrder: input.sortOrder ?? 0,
        },
      });

      return newCategory;
    }),

  /**
   * Update a category
   */
  update: protectedProcedure
    .input(schemas.updateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const updatedCategory = await ctx.db.category.updateMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
          ...(input.archived !== undefined && { archived: input.archived }),
        },
      });

      if (updatedCategory.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      // Fetch and return the updated category
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      return category!;
    }),

  /**
   * Create a new subcategory
   */
  createSubcategory: protectedProcedure
    .input(schemas.createSubcategorySchema)
    .mutation(async ({ input, ctx }) => {
      // Verify the category belongs to the user
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          userId: ctx.userId,
        },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      const newSubcategory = await ctx.db.subcategory.create({
        data: {
          userId: ctx.userId,
          categoryId: input.categoryId,
          name: input.name,
          sortOrder: input.sortOrder ?? 0,
        },
      });

      return newSubcategory;
    }),

  /**
   * Update a subcategory
   */
  updateSubcategory: protectedProcedure
    .input(schemas.updateSubcategorySchema)
    .mutation(async ({ input, ctx }) => {
      const updatedSubcategory = await ctx.db.subcategory.updateMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
          ...(input.archived !== undefined && { archived: input.archived }),
        },
      });

      if (updatedSubcategory.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcategory not found',
        });
      }

      // Fetch and return the updated subcategory
      const subcategory = await ctx.db.subcategory.findUnique({
        where: { id: input.id },
      });

      return subcategory!;
    }),
});
