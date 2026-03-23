import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import type { CategorySpending } from '@/hooks/useDashboard';
import { formatCurrency, formatPercent } from '@fin-health/shared/format';

const COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-slate-500',
];

const DOT_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#a855f6',
  '#f43f5e',
  '#0ea5e9',
  '#64748b',
];

interface ExpenseTreemapProps {
  categories: CategorySpending[];
  className?: string;
}

export function ExpenseTreemap({ categories, className }: ExpenseTreemapProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div>
            <h3 className="font-headline font-bold">{t('dashboard.spendingAllocation')}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {t('dashboard.breakdownByCategories')}
            </p>
          </div>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">{t('dashboard.noExpenseData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...categories].sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div>
          <h3 className="font-headline font-bold">{t('dashboard.spendingAllocation')}</h3>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {t('dashboard.breakdownByCategories')}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {sorted.map((item, i) => (
            <div key={item.categoryId}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  {item.categoryName}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {formatCurrency(item.total)} ({formatPercent(item.percentage)})
                </span>
              </div>
              <div
                className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-surface-container"
                role="progressbar"
                aria-valuenow={Math.round(item.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.categoryName}: ${formatPercent(item.percentage)}`}
              >
                <div
                  className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {sorted.map((item, i) => (
            <div key={item.categoryId} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                {item.categoryName}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
