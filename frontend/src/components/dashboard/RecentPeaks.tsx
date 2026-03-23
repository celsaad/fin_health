import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { Transaction } from '@fin-health/shared/types';
import { formatCurrency } from '@fin-health/shared/format';
import { format } from 'date-fns';

interface RecentPeaksProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  className?: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="size-10 animate-pulse rounded-full bg-surface-container" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-container" />
        <div className="h-2.5 w-32 animate-pulse rounded bg-surface-container" />
      </div>
      <div className="h-3 w-16 animate-pulse rounded bg-surface-container" />
    </div>
  );
}

export function RecentPeaks({ transactions, isLoading, className }: RecentPeaksProps) {
  const { t } = useTranslation();

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div>
          <h3 className="font-headline font-bold">{t('dashboard.recentSpendingPeaks')}</h3>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">{t('dashboard.noExpensesForPeriod')}</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {transactions.map((tx) => {
                const config = getCategoryIcon(tx.category.name, tx.category.icon, tx.category.color);
                const Icon = config.icon;
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-background"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10`}
                    >
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{tx.description}</p>
                      <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
                        {tx.category.name} &bull; {format(new Date(tx.date), 'MMM dd').toUpperCase()}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-destructive">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!isLoading && transactions && transactions.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              to="/transactions"
              className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              {t('dashboard.viewAllTransactions')}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
