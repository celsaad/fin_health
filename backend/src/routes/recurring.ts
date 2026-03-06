import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRecurringSchema, updateRecurringSchema } from '../validators/recurring';
import { resolveCategory } from '../services/categoryResolver';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/recurring — list all templates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const templates = await prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, type: true } },
        subcategory: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ recurringTransactions: templates });
  } catch (err) {
    next(err);
  }
});

// POST /api/recurring — create template
router.post(
  '/',
  validate(createRecurringSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
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
      } = req.body;

      const { categoryId, subcategoryId } = await resolveCategory(
        userId,
        categoryName,
        type,
        subcategoryName
      );

      const template = await prisma.recurringTransaction.create({
        data: {
          amount,
          type,
          description,
          frequency,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          notes: notes || null,
          categoryId,
          subcategoryId: subcategoryId || null,
          userId,
        },
        include: {
          category: { select: { id: true, name: true, type: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({ recurringTransaction: template });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/recurring/:id — single
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const template = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: {
        category: { select: { id: true, name: true, type: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    if (!template) {
      throw new AppError('Recurring transaction not found', 404);
    }

    res.json({ recurringTransaction: template });
  } catch (err) {
    next(err);
  }
});

// PUT /api/recurring/:id — update
router.put(
  '/:id',
  validate(updateRecurringSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existing = await prisma.recurringTransaction.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError('Recurring transaction not found', 404);
      }

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
      } = req.body;

      const updateData: Record<string, unknown> = {};

      if (amount !== undefined) updateData.amount = amount;
      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (notes !== undefined) updateData.notes = notes;

      if (categoryName) {
        const effectiveType = type || existing.type;
        const resolved = await resolveCategory(
          userId,
          categoryName,
          effectiveType,
          subcategoryName || undefined
        );
        updateData.categoryId = resolved.categoryId;
        updateData.subcategoryId = resolved.subcategoryId || null;
      } else if (subcategoryName === null) {
        updateData.subcategoryId = null;
      }

      const template = await prisma.recurringTransaction.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { id: true, name: true, type: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      res.json({ recurringTransaction: template });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/recurring/:id — delete
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Recurring transaction not found', 404);
    }

    await prisma.recurringTransaction.delete({ where: { id } });

    res.json({ message: 'Recurring transaction deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/recurring/:id/toggle — toggle isActive
router.patch('/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Recurring transaction not found', 404);
    }

    const template = await prisma.recurringTransaction.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        category: { select: { id: true, name: true, type: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    res.json({ recurringTransaction: template });
  } catch (err) {
    next(err);
  }
});

export default router;
