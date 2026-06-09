import { z } from 'zod';
import { router, protectedProcedure, proProcedure } from '../trpc';
import {
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
  getYearlyOverview,
  getTrend,
  getInsights,
} from '../services/dashboardService';

const currencyField = z.string().length(3).toUpperCase().default('USD');

const monthYearInput = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  currency: currencyField,
});

export const dashboardRouter = router({
  summary: protectedProcedure.input(monthYearInput).query(async ({ ctx, input }) => {
    const raw = await getSummary(ctx.userId, input.month, input.year, input.currency);
    return {
      totalIncome: Number(raw.totalIncome),
      totalExpenses: Number(raw.totalExpenses),
      net: Number(raw.net),
      transactionCount: raw.transactionCount,
    };
  }),

  breakdown: protectedProcedure.input(monthYearInput).query(async ({ ctx, input }) => {
    const breakdown = await getMonthlyBreakdown(
      ctx.userId,
      input.month,
      input.year,
      input.currency,
    );
    return { breakdown };
  }),

  categoryBreakdown: protectedProcedure.input(monthYearInput).query(async ({ ctx, input }) => {
    const categories = await getCategoryBreakdown(
      ctx.userId,
      input.month,
      input.year,
      input.currency,
    );
    return { categories };
  }),

  yearly: protectedProcedure
    .input(z.object({ year: z.number().int(), currency: currencyField }))
    .query(async ({ ctx, input }) => {
      const raw = await getYearlyOverview(ctx.userId, input.year, input.currency);
      const months = raw.map((m) => ({
        month: m.month,
        income: Number(m.income),
        expenses: Number(m.expenses),
        net: Number(m.net),
      }));
      return { months };
    }),

  // Add `expense` (number) alongside `expenses` so older mobile code still works.
  trend: protectedProcedure
    .input(
      z.object({ months: z.number().int().min(1).max(24).default(6), currency: currencyField }),
    )
    .query(async ({ ctx, input }) => {
      const raw = await getTrend(ctx.userId, input.months, input.currency);
      const trend = raw.map((p) => ({
        month: p.month,
        year: p.year,
        label: p.label,
        income: Number(p.income),
        expense: Number(p.expenses),
        expenses: Number(p.expenses),
      }));
      return { trend };
    }),

  insights: proProcedure.input(monthYearInput).query(async ({ ctx, input }) => {
    const insights = await getInsights(ctx.userId, input.month, input.year, input.currency);
    return { insights };
  }),
});
