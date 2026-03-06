import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useDeleteBudget, type Budget } from '@/hooks/useBudgets';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
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
              <Icon className={`size-4 ${config.color}`} />
            </div>
            <span className="truncate">{categoryName}</span>
            {budget.isRecurring && (
              <Badge variant="secondary" className="text-xs font-normal">
                Recurring
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete budget"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              Spent: <span className="font-medium text-foreground">{formatCurrency(budget.spent)}</span>
            </span>
            <span className="text-muted-foreground">
              Limit: <span className="font-medium text-foreground">{formatCurrency(budget.amount)}</span>
            </span>
          </div>
          <BudgetProgressBar spent={budget.spent} budget={budget.amount} />
          <div className="text-sm font-medium">
            {budget.remaining >= 0 ? (
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(budget.remaining)} left
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(Math.abs(budget.remaining))} over
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Budget"
        description={`Are you sure you want to delete the budget for "${budget.category?.name ?? 'Overall'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />
    </>
  );
}
