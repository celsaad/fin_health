import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, X } from 'lucide-react';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { QueryError } from '@/components/shared/QueryError';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { SpendingCard, CATEGORY_COLORS } from '@/components/spending/SpendingCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useCategoryBreakdown, useTrend } from '@/hooks/useDashboard';
import type { CategorySpending } from '@/hooks/useDashboard';
import { formatCurrency } from '@fin-health/shared/format';

function DetailPanel({
  category,
  colorIndex,
  onClose,
}: {
  category: CategorySpending;
  colorIndex: number;
  onClose: () => void;
}) {
  const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
  const config = getCategoryIcon(category.categoryName);
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
            >
              <Icon className={`size-4.5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold">{category.categoryName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(category.total)} &middot; {category.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close detail panel">
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {category.subcategories.map((sub) => (
            <div key={sub.subcategoryId ?? 'uncategorized'}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium truncate">{sub.subcategoryName}</span>
                <span className="shrink-0 ml-2">{formatCurrency(sub.total)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(sub.percentage, 100)}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0 w-12 text-right">
                  {sub.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Spending() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [searchParams] = useSearchParams();
  const initialCategoryId = searchParams.get('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);

  const {
    data: categories,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCategoryBreakdown(month, year);
  const { data: trend } = useTrend(2);

  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) ?? 0;

  // Calculate trend percentage
  let trendPct: number | null = null;
  if (trend && trend.length >= 2) {
    const current = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    if (previous.expenses > 0) {
      trendPct = Math.round(((current.expenses - previous.expenses) / previous.expenses) * 100);
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const selectedCategory = categories?.find((c) => c.categoryId === selectedCategoryId);
  const selectedColorIndex = categories?.findIndex((c) => c.categoryId === selectedCategoryId) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spending Breakdown</h1>
          <p className="text-sm text-muted-foreground">Expenses by category and subcategory</p>
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

      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading ? (
        <>
          <CardSkeleton />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : categories && categories.length > 0 ? (
        <div
          className={`space-y-6 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        >
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
                  {trendPct > 0 ? '+' : ''}
                  {trendPct}% from last month
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Cards grid */}
            <div className="flex-1 min-w-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {categories.map((category, index) => (
                  <SpendingCard
                    key={category.categoryId}
                    categoryName={category.categoryName}
                    total={category.total}
                    percentage={category.percentage}
                    colorIndex={index}
                    selected={selectedCategoryId === category.categoryId}
                    onClick={() => toggleCategory(category.categoryId)}
                  />
                ))}
              </div>
            </div>

            {/* Detail side panel */}
            {selectedCategory && (
              <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6 lg:self-start">
                <DetailPanel
                  category={selectedCategory}
                  colorIndex={selectedColorIndex}
                  onClose={() => setSelectedCategoryId(null)}
                />
              </div>
            )}
          </div>
        </div>
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
