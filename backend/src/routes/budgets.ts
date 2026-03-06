import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upsertBudgetSchema, copyBudgetsSchema } from '../validators/budget';
import { getBudgetsWithSpent } from '../services/budgetService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/budgets?month=&year= — get budgets with spent calculation
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12) {
      throw new AppError('Valid month (1-12) and year are required', 400);
    }

    const budgets = await getBudgetsWithSpent(userId, month, year);

    res.json({ budgets });
  } catch (err) {
    next(err);
  }
});

// POST /api/budgets/copy-previous — copy non-recurring budgets from previous month
router.post(
  '/copy-previous',
  validate(copyBudgetsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { month, year } = req.body;

      // Compute previous month/year
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      // Fetch non-recurring budgets from previous month
      const previousBudgets = await prisma.budget.findMany({
        where: {
          userId,
          month: prevMonth,
          year: prevYear,
          isRecurring: false,
        },
      });

      let copied = 0;
      const budgets = [];

      for (const prev of previousBudgets) {
        const budget = await prisma.budget.upsert({
          where: {
            userId_categoryId_month_year: {
              userId,
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
            userId,
          },
        });

        // upsert returns existing record on conflict — only count if newly created
        if (budget.createdAt.getTime() === budget.updatedAt.getTime()) {
          copied++;
        }
        budgets.push(budget);
      }

      res.json({ budgets, copied });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/budgets — upsert
router.post(
  '/',
  validate(upsertBudgetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { amount, categoryId, isRecurring } = req.body;

      const effectiveCategoryId = categoryId || null;
      const effectiveMonth = isRecurring ? 0 : req.body.month;
      const effectiveYear = isRecurring ? 0 : req.body.year;

      // If categoryId is provided, verify it belongs to user
      if (effectiveCategoryId) {
        const category = await prisma.category.findFirst({
          where: { id: effectiveCategoryId, userId },
        });
        if (!category) {
          throw new AppError('Category not found', 404);
        }
      }

      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId,
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
          userId,
        },
      });

      res.status(201).json({ budget });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/budgets/:id — delete
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    await prisma.budget.delete({ where: { id } });

    res.json({ message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
