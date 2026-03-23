import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { ExpenseTreemap } from '@/components/dashboard/ExpenseTreemap';
import { EditorialInsightCard } from '@/components/dashboard/EditorialInsightCard';
import { RecentPeaks } from '@/components/dashboard/RecentPeaks';
import { BudgetComplianceTable } from '@/components/dashboard/BudgetComplianceTable';
import {
  useSummary,
  useCategoryBreakdown,
  useTrend,
  useRecentPeaks,
} from '@/hooks/useDashboard';
import { useBudgets } from '@/hooks/useBudgets';

export default function Dashboard() {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Current month summary
  const summary$ = useSummary(month, year);

  // Previous month summary (for MoM calculation)
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevSummary$ = useSummary(prevMonth, prevYear);

  const categoryBreakdown$ = useCategoryBreakdown(month, year);
  const trend$ = useTrend(6);
  const { data: budgets } = useBudgets(month, year);
  const recentPeaks$ = useRecentPeaks(month, year);

  // Derive month-over-month net change percentage
  const netChangePercent = useMemo(() => {
    if (!summary$.data || !prevSummary$.data || prevSummary$.data.net === 0) return null;
    return ((summary$.data.net - prevSummary$.data.net) / Math.abs(prevSummary$.data.net)) * 100;
  }, [summary$.data, prevSummary$.data]);

  const hasError =
    summary$.isError || categoryBreakdown$.isError || trend$.isError || recentPeaks$.isError;

  return (
    <div className="space-y-8">
      {/* Page header with date selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-lg font-bold">{t('dashboard.title')}</h1>
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
            recentPeaks$.refetch();
          }}
        />
      ) : (
        <>
          {/* Row 1: Summary Cards */}
          {summary$.isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : summary$.data ? (
            <SummaryCards summary={summary$.data} netChangePercent={netChangePercent} />
          ) : null}

          {/* Row 2: Cash Flow Trend + Editorial Insight */}
          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              {trend$.isLoading ? (
                <CardSkeleton />
              ) : trend$.data ? (
                <TrendChart trend={trend$.data} />
              ) : null}
            </div>
            <div className="col-span-12 lg:col-span-4">
              <EditorialInsightCard month={month} year={year} />
            </div>
          </section>

          {/* Row 3: Spending Allocation + Recent Peaks */}
          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-7">
              {categoryBreakdown$.isLoading ? (
                <CardSkeleton />
              ) : categoryBreakdown$.data ? (
                <ExpenseTreemap categories={categoryBreakdown$.data} />
              ) : null}
            </div>
            <div className="col-span-12 xl:col-span-5">
              <RecentPeaks
                transactions={recentPeaks$.data}
                isLoading={recentPeaks$.isLoading}
              />
            </div>
          </section>

          {/* Row 4: Budget Compliance */}
          {categoryBreakdown$.data && budgets ? (
            <BudgetComplianceTable
              categories={categoryBreakdown$.data}
              budgets={budgets}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
