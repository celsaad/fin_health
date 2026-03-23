import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { CategorySpending } from '@/hooks/useDashboard';
import type { Budget } from '@/hooks/useBudgets';
import { formatCurrency } from '@fin-health/shared/format';

const DOT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#a855f6', '#f43f5e', '#0ea5e9', '#64748b',
];

interface BudgetComplianceRow {
  categoryId: string;
  categoryName: string;
  colorIndex: number;
  budgeted: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
}

interface BudgetComplianceTableProps {
  categories: CategorySpending[];
  budgets: Budget[];
  className?: string;
}

export function BudgetComplianceTable({ categories, budgets, className }: BudgetComplianceTableProps) {
  const { t } = useTranslation();

  // Build a lookup for category index in spending breakdown (for color dots)
  const sortedCategories = [...categories].sort((a, b) => b.total - a.total);
  const categoryIndexMap = new Map(sortedCategories.map((c, i) => [c.categoryId, i]));

  // Only show categories that have a budget with a categoryId
  const budgetRows: BudgetComplianceRow[] = budgets
    .filter((b) => b.categoryId)
    .map((b) => {
      const budgeted = Number(b.amount);
      const colorIndex = categoryIndexMap.get(b.categoryId!) ?? -1;

      return {
        categoryId: b.categoryId!,
        categoryName: b.category?.name ?? b.categoryId!,
        colorIndex,
        budgeted,
        spent: b.spent,
        remaining: b.remaining,
        isOverBudget: b.remaining < 0,
      };
    });

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div>
          <h3 className="font-headline font-bold">{t('dashboard.budgetCompliance')}</h3>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {t('dashboard.monthlyCategoryTracking')}
          </p>
        </div>

        {budgetRows.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">{t('budgets.noBudgets')}</p>
            <Link
              to="/budgets"
              className="mt-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              {t('budgets.title')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-background/50 px-8 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('dashboard.category')}
                  </th>
                  <th className="bg-background/50 px-8 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('dashboard.status')}
                  </th>
                  <th className="bg-background/50 px-8 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('dashboard.budgeted')}
                  </th>
                  <th className="bg-background/50 px-8 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('dashboard.spent')}
                  </th>
                  <th className="bg-background/50 px-8 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('dashboard.remaining')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {budgetRows.map((row) => (
                  <tr
                    key={row.categoryId}
                    className="transition-colors hover:bg-background"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              row.colorIndex >= 0
                                ? DOT_COLORS[row.colorIndex % DOT_COLORS.length]
                                : '#94a3b8',
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-bold">{row.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {row.isOverBudget ? (
                        <span
                          className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-400"
                          aria-label={`${t('dashboard.status')}: ${t('dashboard.overBudget')}`}
                        >
                          {t('dashboard.overBudget')}
                        </span>
                      ) : (
                        <span
                          className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          aria-label={`${t('dashboard.status')}: ${t('dashboard.onTrack')}`}
                        >
                          {t('dashboard.onTrack')}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right text-sm text-muted-foreground">
                      {formatCurrency(row.budgeted)}
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-medium">
                      {formatCurrency(row.spent)}
                    </td>
                    <td
                      className={`px-8 py-5 text-right text-sm font-bold ${
                        row.isOverBudget ? 'text-destructive' : ''
                      }`}
                    >
                      {formatCurrency(row.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
