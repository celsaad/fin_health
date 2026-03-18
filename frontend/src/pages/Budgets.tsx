import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, PlusCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryError } from '@/components/shared/QueryError';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { OverallBudget } from '@/components/budgets/OverallBudget';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { useBudgets, useCopyPreviousMonthBudgets } from '@/hooks/useBudgets';

export default function Budgets() {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);

  const { data: budgets, isLoading, isFetching, isError, refetch } = useBudgets(month, year);
  const copyBudgets = useCopyPreviousMonthBudgets();

  const categoryBudgets = budgets?.filter((b) => b.categoryId !== null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('budgets.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('budgets.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <DateRangeSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          <Button
            variant="outline"
            onClick={() => copyBudgets.mutate({ month, year })}
            disabled={copyBudgets.isPending}
            aria-label={t('budgets.copyLastMonth')}
          >
            <Copy className="size-4" />
            <span className="hidden sm:inline">{t('budgets.copyLastMonth')}</span>
          </Button>
          <Button onClick={() => setFormOpen(true)} aria-label={t('budgets.addBudget')}>
            <PlusCircle className="size-4" />
            <span className="hidden sm:inline">{t('budgets.addBudget')}</span>
          </Button>
        </div>
      </div>

      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <>
          <EmptyState
            icon={Wallet}
            title={t('budgets.noBudgets')}
            description={t('budgets.noBudgetsDesc')}
            actionLabel={t('budgets.addBudget')}
            onAction={() => setFormOpen(true)}
          />
          <div className="-mt-4 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => copyBudgets.mutate({ month, year })}
              disabled={copyBudgets.isPending}
            >
              {t('budgets.orCopyLastMonth')}
            </button>
          </div>
        </>
      ) : (
        <div
          className={`space-y-6 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        >
          <OverallBudget budgets={budgets} />

          {categoryBudgets.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">{t('budgets.categoryBudgets')}</h2>
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
        existingCategoryIds={categoryBudgets.map((b) => b.categoryId!)}
      />
    </div>
  );
}
