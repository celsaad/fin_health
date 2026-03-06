import { useState } from 'react';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
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

  const { data: summary, isLoading: summaryLoading } = useSummary(month, year);
  const { data: breakdown, isLoading: breakdownLoading } = useBreakdown(month, year);
  const { data: trend, isLoading: trendLoading } = useTrend(6);
  const { data: budgets } = useBudgets(month, year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your financial overview at a glance
          </p>
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

      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : summary ? (
        <SummaryCards summary={summary} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {breakdownLoading ? (
          <CardSkeleton />
        ) : breakdown ? (
          <ExpensePieChart breakdown={breakdown} />
        ) : null}

        {trendLoading ? (
          <CardSkeleton />
        ) : trend ? (
          <TrendChart trend={trend} />
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {breakdownLoading ? (
          <CardSkeleton />
        ) : breakdown ? (
          <TopCategories breakdown={breakdown} budgets={budgets} />
        ) : null}

        {breakdownLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : breakdown ? (
          <MonthlyTable breakdown={breakdown} />
        ) : null}
      </div>
    </div>
  );
}
