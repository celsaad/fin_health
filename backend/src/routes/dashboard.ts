import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePro } from '../middleware/requirePro';
import { AppError } from '../middleware/errorHandler';
import {
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
  getYearlyOverview,
  getTrend,
  getInsights,
} from '../services/dashboardService';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/dashboard/summary?month=&year=
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12) {
      throw new AppError('Valid month (1-12) and year are required', 400);
    }

    const summary = await getSummary(userId, month, year);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/breakdown?month=&year=
router.get('/breakdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12) {
      throw new AppError('Valid month (1-12) and year are required', 400);
    }

    const breakdown = await getMonthlyBreakdown(userId, month, year);
    res.json({ breakdown });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/category-breakdown?month=&year=
router.get('/category-breakdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12) {
      throw new AppError('Valid month (1-12) and year are required', 400);
    }

    const categories = await getCategoryBreakdown(userId, month, year);
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/yearly?year=
router.get('/yearly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const year = parseInt(req.query.year as string, 10);

    if (!year) {
      throw new AppError('Year is required', 400);
    }

    const overview = await getYearlyOverview(userId, year);
    res.json({ months: overview });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trend?months=
router.get('/trend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const months = parseInt(req.query.months as string, 10) || 6;

    if (months < 1 || months > 24) {
      throw new AppError('Months must be between 1 and 24', 400);
    }

    const trend = await getTrend(userId, months);
    res.json({ trend });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/insights?month=&year=
router.get('/insights', requirePro, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12) {
      throw new AppError('Valid month (1-12) and year are required', 400);
    }

    const insights = await getInsights(userId, month, year);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
});

export default router;
