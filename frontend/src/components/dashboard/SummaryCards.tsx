import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const isPositive = summary.net >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Net balance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
            <div className={`rounded-lg p-2 ${isPositive ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <DollarSign className={`size-4 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`} />
            </div>
          </div>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(summary.net)}</p>
        </CardContent>
      </Card>

      {/* Income */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Income</p>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-2">
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(summary.totalIncome)}</p>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Expenses</p>
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-2">
              <TrendingDown className="size-4 text-red-500" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Transactions</p>
            <div className="rounded-lg bg-primary/10 p-2">
              <Activity className="size-4 text-primary" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-bold">{summary.transactionCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
