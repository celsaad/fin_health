/**
 * Main app router
 * Aggregates all sub-routers
 */

import { router } from './trpc.js';
import { authRouter } from './routers/auth.js';
import { settingsRouter } from './routers/settings.js';
import { categoriesRouter } from './routers/categories.js';
import { budgetsRouter } from './routers/budgets.js';
import { expensesRouter } from './routers/expenses.js';

export const appRouter = router({
  auth: authRouter,
  settings: settingsRouter,
  categories: categoriesRouter,
  budgets: budgetsRouter,
  expenses: expensesRouter,
});

export type AppRouter = typeof appRouter;
