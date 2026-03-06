import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {budget.category?.name ?? 'Overall Budget'}
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
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{formatCurrency(budget.amount)}</span>
            <span className="text-sm text-muted-foreground">budgeted</span>
          </div>
          <BudgetProgressBar spent={budget.spent} budget={budget.amount} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Remaining</span>
            <span className={budget.remaining < 0 ? 'font-medium text-red-600' : 'font-medium text-green-600'}>
              {formatCurrency(budget.remaining)}
            </span>
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
