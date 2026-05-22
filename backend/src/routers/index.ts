import { router } from '../trpc';
import { authRouter } from './auth';
import { transactionsRouter } from './transactions';
import { categoriesRouter } from './categories';
import { budgetsRouter } from './budgets';
import { recurringRouter } from './recurring';
import { dashboardRouter } from './dashboard';
import { billingRouter } from './billing';

export const appRouter = router({
  auth: authRouter,
  transactions: transactionsRouter,
  categories: categoriesRouter,
  budgets: budgetsRouter,
  recurring: recurringRouter,
  dashboard: dashboardRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
