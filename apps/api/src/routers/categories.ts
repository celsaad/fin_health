/**
 * Categories and subcategories router
 */

import { TRPCError } from '@trpc/server';
import { router } from '../trpc.js';
import { protectedProcedure } from '../middleware/index.js';
import { schemas } from '@fin-health/domain';
import { categories, subcategories } from '@fin-health/db';
import { eq, and, asc } from 'drizzle-orm';

export const categoriesRouter = router({
  /**
   * List all categories with their subcategories
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all categories for the user
    const userCategories = await ctx.db
      .select()
      .from(categories)
      .where(eq(categories.userId, ctx.userId))
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    // Fetch all subcategories for the user
    const userSubcategories = await ctx.db
      .select()
      .from(subcategories)
      .where(eq(subcategories.userId, ctx.userId))
      .orderBy(asc(subcategories.sortOrder), asc(subcategories.name));

    // Group subcategories by category
    const subcategoriesByCategory = userSubcategories.reduce(
      (acc, sub) => {
        if (!acc[sub.categoryId]) {
          acc[sub.categoryId] = [];
        }
        acc[sub.categoryId]!.push(sub);
        return acc;
      },
      {} as Record<string, typeof userSubcategories>
    );

    // Combine categories with their subcategories
    return userCategories.map((category) => ({
      ...category,
      subcategories: subcategoriesByCategory[category.id] || [],
    }));
  }),

  /**
   * Create a new category
   */
  create: protectedProcedure
    .input(schemas.createCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          userId: ctx.userId,
          name: input.name,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();

      if (!newCategory) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
        });
      }

      return newCategory;
    }),

  /**
   * Update a category
   */
  update: protectedProcedure
    .input(schemas.updateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.sortOrder !== undefined) {
        updateData.sortOrder = input.sortOrder;
      }
      if (input.archived !== undefined) {
        updateData.archived = input.archived;
      }

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set(updateData)
        .where(and(eq(categories.id, input.id), eq(categories.userId, ctx.userId)))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return updatedCategory;
    }),

  /**
   * Create a new subcategory
   */
  createSubcategory: protectedProcedure
    .input(schemas.createSubcategorySchema)
    .mutation(async ({ input, ctx }) => {
      // Verify the category belongs to the user
      const [category] = await ctx.db
        .select()
        .from(categories)
        .where(and(eq(categories.id, input.categoryId), eq(categories.userId, ctx.userId)))
        .limit(1);

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      const [newSubcategory] = await ctx.db
        .insert(subcategories)
        .values({
          userId: ctx.userId,
          categoryId: input.categoryId,
          name: input.name,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();

      if (!newSubcategory) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create subcategory',
        });
      }

      return newSubcategory;
    }),

  /**
   * Update a subcategory
   */
  updateSubcategory: protectedProcedure
    .input(schemas.updateSubcategorySchema)
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.sortOrder !== undefined) {
        updateData.sortOrder = input.sortOrder;
      }
      if (input.archived !== undefined) {
        updateData.archived = input.archived;
      }

      const [updatedSubcategory] = await ctx.db
        .update(subcategories)
        .set(updateData)
        .where(and(eq(subcategories.id, input.id), eq(subcategories.userId, ctx.userId)))
        .returning();

      if (!updatedSubcategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subcategory not found',
        });
      }

      return updatedSubcategory;
    }),
});
