import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { stringify } from 'csv-stringify';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  bulkDeleteSchema,
} from '../validators/transaction';
import { resolveCategory } from '../services/categoryResolver';
import { getPagination } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

function formatTransactionDate<T extends { date: Date }>(t: T): T & { date: string } {
  return { ...t, date: t.date.toISOString().split('T')[0] };
}

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/transactions — list with pagination, filters, sorting
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { skip, take, page } = getPagination(req.query as { page?: string; limit?: string });

    const { type, categoryId, subcategoryId, startDate, endDate, search, sortBy, sortOrder } =
      req.query;

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
    };

    if (type && (type === 'expense' || type === 'income')) {
      where.type = type;
    }

    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    if (subcategoryId && typeof subcategoryId === 'string') {
      where.subcategoryId = subcategoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === 'string') {
        where.date.gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate && typeof endDate === 'string') {
        where.date.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (search && typeof search === 'string') {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const orderField = (sortBy as string) || 'date';
    const orderDir = (sortOrder as string) === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.TransactionOrderByWithRelationInput = { [orderField]: orderDir };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, type: true } },
          subcategory: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions: transactions.map(formatTransactionDate),
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/export/csv — export as CSV
router.get('/export/csv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { type, categoryId, startDate, endDate, search } = req.query;

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
    };

    if (type && (type === 'expense' || type === 'income')) {
      where.type = type;
    }
    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === 'string') {
        where.date.gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate && typeof endDate === 'string') {
        where.date.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }
    if (search && typeof search === 'string') {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');

    const stringifier = stringify({
      header: true,
      columns: ['Date', 'Type', 'Description', 'Amount', 'Category', 'Subcategory', 'Notes'],
    });

    stringifier.pipe(res);

    for (const t of transactions) {
      stringifier.write([
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        t.description,
        t.amount.toString(),
        t.category.name,
        t.subcategory?.name || '',
        t.notes || '',
      ]);
    }

    stringifier.end();
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions — create
router.post(
  '/',
  validate(createTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { amount, type, description, date, categoryName, subcategoryName, notes } = req.body;

      const { categoryId, subcategoryId } = await resolveCategory(
        userId,
        categoryName,
        type,
        subcategoryName,
      );

      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type,
          description,
          date: new Date(date + 'T12:00:00.000Z'),
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

      res.status(201).json({ transaction: formatTransactionDate(transaction) });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/transactions/bulk-delete — soft delete multiple
router.post(
  '/bulk-delete',
  validate(bulkDeleteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { ids } = req.body;

      const result = await prisma.transaction.updateMany({
        where: {
          id: { in: ids },
          userId,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });

      res.json({ deleted: result.count });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/transactions/:id — single
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, type: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({ transaction: formatTransactionDate(transaction) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/transactions/:id — update
router.put(
  '/:id',
  validate(updateTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existing = await prisma.transaction.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!existing) {
        throw new AppError('Transaction not found', 404);
      }

      const { amount, type, description, date, categoryName, subcategoryName, notes } = req.body;

      const updateData: Prisma.TransactionUpdateInput = {};

      if (amount !== undefined) updateData.amount = amount;
      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date + 'T12:00:00.000Z');
      if (notes !== undefined) updateData.notes = notes;

      // If categoryName changes, resolve category
      if (categoryName) {
        const effectiveType = type || existing.type;
        const { categoryId, subcategoryId } = await resolveCategory(
          userId,
          categoryName,
          effectiveType,
          subcategoryName || undefined,
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
          category: { select: { id: true, name: true, type: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      res.json({ transaction: formatTransactionDate(transaction) });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/transactions/:id — soft delete
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
