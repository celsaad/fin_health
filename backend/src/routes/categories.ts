import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateCategorySchema,
  mergeCategorySchema,
  createSubcategorySchema,
  renameSubcategorySchema,
} from '../validators/category';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/categories — list with subcategories and transaction count
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        subcategories: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            transactions: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id — update name, icon, color
router.put(
  '/:id',
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check uniqueness for the new name (only if name is being changed)
      if (name) {
        const duplicate = await prisma.category.findUnique({
          where: {
            userId_name_type: { userId, name, type: category.type },
          },
        });

        if (duplicate && duplicate.id !== id) {
          throw new AppError('A category with this name already exists', 409);
        }
      }

      const data: { name?: string; icon?: string; color?: string } = {};
      if (name !== undefined) data.name = name;
      if (icon !== undefined) data.icon = icon;
      if (color !== undefined) data.color = color;

      const updated = await prisma.category.update({
        where: { id },
        data,
      });

      res.json({ category: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/categories/:id — delete only if no transactions
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category._count.transactions > 0) {
      throw new AppError(
        'Cannot delete category with existing transactions. Merge it into another category instead.',
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories/:id/merge — merge source into target
router.post(
  '/:id/merge',
  validate(mergeCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const sourceId = req.params.id;
      const { targetCategoryId } = req.body;

      if (sourceId === targetCategoryId) {
        throw new AppError('Cannot merge a category into itself', 400);
      }

      // Verify both categories belong to user
      const [source, target] = await Promise.all([
        prisma.category.findFirst({ where: { id: sourceId, userId } }),
        prisma.category.findFirst({ where: { id: targetCategoryId, userId } }),
      ]);

      if (!source) {
        throw new AppError('Source category not found', 404);
      }
      if (!target) {
        throw new AppError('Target category not found', 404);
      }

      // Reassign all transactions and delete source in a transaction
      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { categoryId: sourceId, userId },
          data: { categoryId: targetCategoryId, subcategoryId: null },
        }),
        prisma.recurringTransaction.updateMany({
          where: { categoryId: sourceId, userId },
          data: { categoryId: targetCategoryId, subcategoryId: null },
        }),
        prisma.budget.updateMany({
          where: { categoryId: sourceId, userId },
          data: { categoryId: targetCategoryId },
        }),
        prisma.subcategory.deleteMany({
          where: { categoryId: sourceId },
        }),
        prisma.category.delete({ where: { id: sourceId } }),
      ]);

      res.json({ message: 'Category merged successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/categories/:id/subcategories — list subcategories
router.get('/:id/subcategories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: id },
      orderBy: { name: 'asc' },
    });

    res.json({ subcategories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories/:id/subcategories — create subcategory
router.post(
  '/:id/subcategories',
  validate(createSubcategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { name } = req.body;

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      const subcategory = await prisma.subcategory.create({
        data: { name, categoryId: id },
      });

      res.status(201).json({ subcategory });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/categories/:id/subcategories/:subId — rename subcategory
router.put(
  '/:id/subcategories/:subId',
  validate(renameSubcategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id, subId } = req.params;
      const { name } = req.body;

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      const subcategory = await prisma.subcategory.findFirst({
        where: { id: subId, categoryId: id },
      });

      if (!subcategory) {
        throw new AppError('Subcategory not found', 404);
      }

      const updated = await prisma.subcategory.update({
        where: { id: subId },
        data: { name },
      });

      res.json({ subcategory: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/categories/:id/subcategories/:subId — delete subcategory
router.delete(
  '/:id/subcategories/:subId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id, subId } = req.params;

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      const subcategory = await prisma.subcategory.findFirst({
        where: { id: subId, categoryId: id },
        include: {
          _count: { select: { transactions: true } },
        },
      });

      if (!subcategory) {
        throw new AppError('Subcategory not found', 404);
      }

      if (subcategory._count.transactions > 0) {
        throw new AppError('Cannot delete subcategory with existing transactions', 400);
      }

      await prisma.subcategory.delete({ where: { id: subId } });

      res.json({ message: 'Subcategory deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
