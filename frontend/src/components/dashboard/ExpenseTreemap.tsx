import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategorySpending } from '@/hooks/useDashboard';
import { formatCurrency, formatPercent } from '@fin-health/shared/format';

const COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#14b8a6',
  '#84cc16',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.categoryName}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(data.total)}</p>
    </div>
  );
}

interface ExpenseTreemapProps {
  categories: CategorySpending[];
}

export function ExpenseTreemap({ categories }: ExpenseTreemapProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.expenseBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">{t('dashboard.noExpenseData')}</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const totalSpent = sorted.reduce((sum, item) => sum + item.total, 0);
  const chartHeight = Math.max(200, sorted.length * 40);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('dashboard.expenseBreakdown')}</CardTitle>
          <span className="text-lg font-semibold text-muted-foreground">
            {formatCurrency(totalSpent)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="categoryName"
              width={100}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24}>
              {sorted.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
          {sorted.map((item, i) => (
            <div key={item.categoryId} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{item.categoryName}</span>
              <span className="ml-auto font-medium">{formatPercent(item.percentage)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
