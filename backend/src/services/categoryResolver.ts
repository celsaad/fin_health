import { CategoryType } from '@prisma/client';
import prisma from '../lib/prisma';

interface ResolvedCategory {
  categoryId: string;
  subcategoryId?: string;
}

export async function resolveCategory(
  userId: string,
  categoryName: string,
  type: CategoryType,
  subcategoryName?: string
): Promise<ResolvedCategory> {
  return prisma.$transaction(async (tx) => {
    // Find or create the category
    let category = await tx.category.findUnique({
      where: {
        userId_name_type: { userId, name: categoryName, type },
      },
    });

    if (!category) {
      category = await tx.category.create({
        data: { name: categoryName, type, userId },
      });
    }

    const result: ResolvedCategory = { categoryId: category.id };

    // Find or create subcategory if provided
    if (subcategoryName) {
      let subcategory = await tx.subcategory.findUnique({
        where: {
          categoryId_name: { categoryId: category.id, name: subcategoryName },
        },
      });

      if (!subcategory) {
        subcategory = await tx.subcategory.create({
          data: { name: subcategoryName, categoryId: category.id },
        });
      }

      result.subcategoryId = subcategory.id;
    }

    return result;
  });
}
