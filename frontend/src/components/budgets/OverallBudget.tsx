import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import type { Budget } from '@/hooks/useBudgets';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface OverallBudgetProps {
  budgets: Budget[];
}

export function OverallBudget({ budgets }: OverallBudgetProps) {
  const overallBudget = budgets.find((b) => b.categoryId === null);
  const categoryBudgets = budgets.filter((b) => b.categoryId !== null);

  const totalBudgeted = overallBudget
    ? overallBudget.amount
    : categoryBudgets.reduce((sum, b) => sum + Number(b.amount), 0);

  const totalSpent = overallBudget
    ? overallBudget.spent
    : categoryBudgets.reduce((sum, b) => sum + Number(b.spent), 0);

  const totalRemaining = totalBudgeted - totalSpent;
  const pct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const monthLabel = budgets.length > 0 ? MONTH_NAMES[budgets[0].month] : '';

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              GOAL: {formatCurrency(totalBudgeted)}
            </p>
            <p className="text-sm font-semibold text-primary">
              {pct}% reached
            </p>
          </div>
        </div>

        <BudgetProgressBar spent={totalSpent} budget={totalBudgeted} />

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" />
          <span>
            {totalRemaining >= 0 ? (
              <>{formatCurrency(totalRemaining)} remaining for {monthLabel}</>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(Math.abs(totalRemaining))} over budget for {monthLabel}
              </span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
