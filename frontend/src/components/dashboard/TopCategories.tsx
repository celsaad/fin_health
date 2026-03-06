import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { BreakdownItem } from '@/hooks/useDashboard';
import type { Budget } from '@/hooks/useBudgets';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface TopCategoriesProps {
  breakdown: BreakdownItem[];
  budgets?: Budget[];
}

export function TopCategories({ breakdown, budgets }: TopCategoriesProps) {
  const sorted = [...breakdown].sort((a, b) => b.total - a.total).slice(0, 6);

  if (sorted.length === 0) {
    return null;
  }

  const budgetMap = new Map(
    budgets
      ?.filter((b) => b.categoryId)
      .map((b) => [b.categoryId!, b]) ?? []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((item) => {
            const config = getCategoryIcon(item.categoryName);
            const Icon = config.icon;
            const budget = budgetMap.get(item.categoryId);
            const pct = budget ? Math.round((item.total / Number(budget.amount)) * 100) : null;

            return (
              <Link
                key={item.categoryId}
                to={`/spending?category=${item.categoryId}`}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
                >
                  <Icon className={`size-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.categoryName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(0)}% of expenses
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
                  {pct !== null && (
                    <p
                      className={`text-xs font-medium ${
                        pct > 100
                          ? 'text-red-600 dark:text-red-400'
                          : pct > 80
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {pct}% of budget
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
