import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { BreakdownItem } from '@/hooks/useDashboard';
import type { Budget } from '@/hooks/useBudgets';
import { formatCurrency, formatPercent } from '@fin-health/shared/format';

interface TopCategoriesProps {
  breakdown: BreakdownItem[];
  budgets?: Budget[];
}

export function TopCategories({ breakdown, budgets }: TopCategoriesProps) {
  const { t } = useTranslation();
  const sorted = [...breakdown].sort((a, b) => b.total - a.total).slice(0, 6);

  if (sorted.length === 0) {
    return null;
  }

  const budgetMap = new Map(
    budgets?.filter((b) => b.categoryId).map((b) => [b.categoryId!, b]) ?? [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.topCategories')}</CardTitle>
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
                  <Icon className={`size-5 ${config.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.categoryName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(item.percentage)} {t('dashboard.ofExpenses')}
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
                      {pct}% {t('dashboard.ofBudget')}
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
