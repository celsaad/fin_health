import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardSkeleton, ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { CategoryAccordion } from '@/components/spending/CategoryAccordion';
import { Card, CardContent } from '@/components/ui/card';
import { useCategoryBreakdown } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Spending() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [searchParams] = useSearchParams();
  const expandedCategoryId = searchParams.get('category');

  const { data: categories, isLoading } = useCategoryBreakdown(month, year);

  const totalExpenses = categories?.reduce((sum, c) => sum + c.total, 0) ?? 0;

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
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
              <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
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
