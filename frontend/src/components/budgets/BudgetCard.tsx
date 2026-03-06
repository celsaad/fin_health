import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useDeleteBudget, type Budget } from '@/hooks/useBudgets';
import { formatCurrency } from '@fin-health/shared/format';

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard = memo(function BudgetCard({ budget }: BudgetCardProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteBudget = useDeleteBudget();

  const handleDelete = () => {
    deleteBudget.mutate(budget.id);
    setConfirmOpen(false);
  };

  const categoryName = budget.category?.name ?? 'Overall Budget';
  const config = getCategoryIcon(categoryName, budget.category?.icon, budget.category?.color);
  const Icon = config.icon;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2.5">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
            >
              <Icon className={`size-4 ${config.color}`} aria-hidden="true" />
            </div>
            <span className="truncate">{categoryName}</span>
            {budget.isRecurring && (
              <Badge variant="secondary" className="text-xs font-normal">
                {t('budgets.recurring')}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmOpen(true)}
              aria-label={t('budgets.deleteBudgetAriaLabel')}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              {t('budgets.spent')}:{' '}
              <span className="font-medium text-foreground">{formatCurrency(budget.spent)}</span>
            </span>
            <span className="text-muted-foreground">
              {t('budgets.limit')}:{' '}
              <span className="font-medium text-foreground">{formatCurrency(budget.amount)}</span>
            </span>
          </div>
          <BudgetProgressBar spent={budget.spent} budget={budget.amount} />
          <div className="text-sm font-medium">
            {budget.remaining >= 0 ? (
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(budget.remaining)} {t('budgets.left')}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(Math.abs(budget.remaining))} {t('budgets.over')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('budgets.deleteBudget')}
        description={t('budgets.deleteBudgetConfirm', { name: budget.category?.name ?? 'Overall' })}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={t('common.delete')}
      />
    </>
  );
});
