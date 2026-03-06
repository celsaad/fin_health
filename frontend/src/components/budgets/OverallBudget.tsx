import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import type { Budget } from '@/hooks/useBudgets';
import { formatCurrency, getMonthName } from '@fin-health/shared/format';

interface OverallBudgetProps {
  budgets: Budget[];
}

export function OverallBudget({ budgets }: OverallBudgetProps) {
  const { t } = useTranslation();
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

  const monthLabel = budgets.length > 0 ? getMonthName(budgets[0].month) : '';

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('budgets.totalSpent')}</p>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('budgets.goal')}: {formatCurrency(totalBudgeted)}</p>
            <p className="text-sm font-semibold text-primary">{pct}% {t('budgets.reached')}</p>
          </div>
        </div>

        <BudgetProgressBar spent={totalSpent} budget={totalBudgeted} />

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" />
          <span>
            {totalRemaining >= 0 ? (
              <>
                {formatCurrency(totalRemaining)} {t('budgets.remaining')} {t('budgets.for')} {monthLabel}
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(Math.abs(totalRemaining))} {t('budgets.overBudget')} {t('budgets.for')} {monthLabel}
              </span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
