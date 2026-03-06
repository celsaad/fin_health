import { useState } from 'react';
import { PlusCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { OverallBudget } from '@/components/budgets/OverallBudget';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { useBudgets } from '@/hooks/useBudgets';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);

  const { data: budgets, isLoading } = useBudgets(month, year);

  const categoryBudgets = budgets?.filter((b) => b.categoryId !== null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Set and track your monthly spending budgets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          <Button onClick={() => setFormOpen(true)}>
            <PlusCircle className="size-4" />
            Add Budget
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets yet"
          description="Create your first budget to start tracking your spending against your goals."
          actionLabel="Add Budget"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <OverallBudget budgets={budgets} />

          {categoryBudgets.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Category Budgets</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryBudgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultMonth={month}
        defaultYear={year}
      />
    </div>
  );
}
