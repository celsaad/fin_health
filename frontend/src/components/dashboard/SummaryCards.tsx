import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowDown,
  ArrowUp,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '@/hooks/useDashboard';
import { formatCurrency } from '@fin-health/shared/format';

interface SummaryCardsProps {
  summary: DashboardSummary;
  netChangePercent: number | null;
}

export function SummaryCards({ summary, netChangePercent }: SummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Net Balance — Gradient Variant */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_10px_30px_-5px_rgba(70,72,212,0.15)]">
        <CardContent className="pt-6">
          <div className="absolute -top-4 -right-4 size-24 rounded-full bg-white/10 blur-2xl" />
          <Landmark className="absolute top-4 right-4 size-8 text-white/30" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">
            {t('dashboard.netBalance')}
          </p>
          <p className="mt-2 font-headline text-3xl font-extrabold">
            {formatCurrency(summary.net)}
          </p>
          {netChangePercent !== null && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium">
              {netChangePercent >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>
                {netChangePercent >= 0 ? '+' : ''}
                {netChangePercent.toFixed(1)}% {t('dashboard.vsLastMonth')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income */}
      <Card className="transition-transform hover:translate-y-[-2px]">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <ArrowDown className="size-5 text-emerald-600" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.income')}
            </p>
          </div>
          <p className="mt-3 font-headline text-2xl font-bold">
            {formatCurrency(summary.totalIncome)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {t('dashboard.earnedThisMonth')}
          </p>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card className="transition-transform hover:translate-y-[-2px]">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <ArrowUp className="size-5 text-red-500" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.expenses')}
            </p>
          </div>
          <p className="mt-3 font-headline text-2xl font-bold">
            {formatCurrency(summary.totalExpenses)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {t('dashboard.spentThisMonth')}
          </p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card className="transition-transform hover:translate-y-[-2px]">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <ListChecks className="size-5 text-blue-600" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('dashboard.transactionCount')}
            </p>
          </div>
          <p className="mt-3 font-headline text-2xl font-bold">
            {String(summary.transactionCount)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {t('dashboard.totalTransactions')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
