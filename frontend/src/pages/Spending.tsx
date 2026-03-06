import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { CardSkeleton, ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { CategoryAccordion } from '@/components/spending/CategoryAccordion';
import { Card, CardContent } from '@/components/ui/card';
import { useCategoryBreakdown, useTrend } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Spending() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [searchParams] = useSearchParams();
  const expandedCategoryId = searchParams.get('category');

  const { data: categories, isLoading } = useCategoryBreakdown(month, year);
  const { data: trend } = useTrend(2);

  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) ?? 0;

  // Calculate trend percentage
  let trendPct: number | null = null;
  if (trend && trend.length >= 2) {
    const current = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    if (previous.expenses > 0) {
      trendPct = Math.round(
        ((current.expenses - previous.expenses) / previous.expenses) * 100
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spending Breakdown</h1>
          <p className="text-sm text-muted-foreground">
            Expenses by category and subcategory
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

      {isLoading ? (
        <>
          <CardSkeleton />
          <ListSkeleton rows={5} />
        </>
      ) : categories && categories.length > 0 ? (
        <>
          {/* Gradient banner */}
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-primary/80">
            <CardContent className="p-6 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Total Expenses
              </p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
              {trendPct !== null && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                  <TrendingUp className="size-3" />
                  {trendPct > 0 ? '+' : ''}{trendPct}% from last month
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {categories.map((category, index) => (
              <CategoryAccordion
                key={category.categoryId}
                category={category}
                colorIndex={index}
                defaultOpen={category.categoryId === expandedCategoryId}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No expenses for this period</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
