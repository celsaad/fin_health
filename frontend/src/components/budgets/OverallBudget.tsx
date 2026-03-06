import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import type { Budget } from '@/hooks/useBudgets';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Budgeted</p>
            <p className="text-xl font-bold">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>
        <BudgetProgressBar spent={totalSpent} budget={totalBudgeted} />
      </CardContent>
    </Card>
  );
}
