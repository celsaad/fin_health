import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Net Balance',
      value: formatCurrency(summary.net),
      icon: DollarSign,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    },
    {
      label: 'Income',
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    },
    {
      label: 'Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-950',
    },
    {
      label: 'Transactions',
      value: String(summary.transactionCount),
      icon: Activity,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, iconColor, bgColor }) => (
        <Card key={label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div className={`flex size-10 items-center justify-center rounded-full ${bgColor}`}>
                <Icon className={`size-5 ${iconColor}`} />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
