import { useState } from 'react';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ExpensePieChart } from '@/components/dashboard/ExpensePieChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { MonthlyTable } from '@/components/dashboard/MonthlyTable';
import { useSummary, useBreakdown, useTrend } from '@/hooks/useDashboard';
import { useBudgets } from '@/hooks/useBudgets';

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const summary$ = useSummary(month, year);
  const breakdown$ = useBreakdown(month, year);
  const trend$ = useTrend(6);
  const { data: budgets } = useBudgets(month, year);

  const hasError = summary$.isError || breakdown$.isError || trend$.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
            breakdown$.refetch();
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

          <div className="grid gap-6 lg:grid-cols-2">
            {breakdown$.isLoading ? (
              <CardSkeleton />
            ) : breakdown$.data ? (
              <ExpensePieChart breakdown={breakdown$.data} />
            ) : null}

            {trend$.isLoading ? (
              <CardSkeleton />
            ) : trend$.data ? (
              <TrendChart trend={trend$.data} />
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {breakdown$.isLoading ? (
              <CardSkeleton />
            ) : breakdown$.data ? (
              <TopCategories breakdown={breakdown$.data} budgets={budgets} />
            ) : null}

            {breakdown$.isLoading ? (
              <TableSkeleton rows={5} columns={3} />
            ) : breakdown$.data ? (
              <MonthlyTable breakdown={breakdown$.data} />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
