import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ExpenseTreemap } from '@/components/dashboard/ExpenseTreemap';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { MonthlyTable } from '@/components/dashboard/MonthlyTable';
import { useSummary, useCategoryBreakdown, useTrend, useInsights } from '@/hooks/useDashboard';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import { ProGate } from '@/components/shared/ProGate';
import { useBudgets } from '@/hooks/useBudgets';
import { usePlan } from '@/hooks/usePlan';

export default function Dashboard() {
  const { t } = useTranslation();
  const { isPro } = usePlan();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const summary$ = useSummary(month, year);
  const categoryBreakdown$ = useCategoryBreakdown(month, year);
  const trend$ = useTrend(6);
  const insights$ = useInsights(month, year, isPro);
  const { data: budgets } = useBudgets(month, year);

  // Derive flat breakdown for TopCategories and MonthlyTable
  const breakdown = useMemo(
    () =>
      categoryBreakdown$.data?.map((cat) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        total: cat.total,
        percentage: cat.percentage,
      })),
    [categoryBreakdown$.data],
  );

  const hasError = summary$.isError || categoryBreakdown$.isError || trend$.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">Your financial overview at a glance</p>
        </div>
        <DateRangeSelector
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />
      </div>

      {hasError ? (
        <QueryError
          onRetry={() => {
            summary$.refetch();
            categoryBreakdown$.refetch();
            trend$.refetch();
          }}
        />
      ) : (
        <>
          {summary$.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : summary$.data ? (
            <SummaryCards summary={summary$.data} />
          ) : null}

          <ProGate>
            {insights$.isLoading ? (
              <CardSkeleton />
            ) : insights$.data ? (
              <InsightsCard insights={insights$.data} />
            ) : null}
          </ProGate>

          <div className="grid gap-6 lg:grid-cols-2">
            {categoryBreakdown$.isLoading ? (
              <CardSkeleton />
            ) : categoryBreakdown$.data ? (
              <ExpenseTreemap categories={categoryBreakdown$.data} />
            ) : null}

            {trend$.isLoading ? (
              <CardSkeleton />
            ) : trend$.data ? (
              <TrendChart trend={trend$.data} />
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {categoryBreakdown$.isLoading ? (
              <CardSkeleton />
            ) : breakdown ? (
              <TopCategories breakdown={breakdown} budgets={budgets} />
            ) : null}

            {categoryBreakdown$.isLoading ? (
              <TableSkeleton rows={5} columns={3} />
            ) : breakdown ? (
              <MonthlyTable breakdown={breakdown} />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
