import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { TrendData } from '@/hooks/useDashboard';
import { formatCurrency, getShortMonthName } from '@fin-health/shared/format';

interface TrendChartProps {
  trend: TrendData[];
  className?: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg bg-white/70 p-3 shadow-xl backdrop-blur-xl dark:bg-card/70">
        <p className="mb-1 text-sm font-bold">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const INCOME_COLOR = '#4648d4';
const EXPENSE_COLOR = '#f87171';

export function TrendChart({ trend, className }: TrendChartProps) {
  const { t } = useTranslation();

  const chartData = trend.map((item, index) => ({
    ...item,
    label: getShortMonthName(item.month),
    // Opacity ramp: oldest = 0.2, newest = 1.0
    opacity: trend.length > 1 ? 0.2 + (0.8 * index) / (trend.length - 1) : 1,
  }));

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div>
            <h3 className="font-headline text-lg font-bold">{t('dashboard.cashFlowTrend')}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {t('dashboard.incomeVsExpenses')}
            </p>
          </div>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">{t('dashboard.noTrendData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold">{t('dashboard.cashFlowTrend')}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {t('dashboard.incomeVsExpenses')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
              <span className="text-xs font-medium text-muted-foreground">
                {t('dashboard.income')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
              <span className="text-xs font-medium text-muted-foreground">
                {t('dashboard.expenses')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="label"
                tick={({ x, y, payload, index }: { x: number; y: number; payload: { value: string }; index: number }) => (
                  <text
                    x={x}
                    y={y + 16}
                    textAnchor="middle"
                    className={
                      index === chartData.length - 1
                        ? 'fill-foreground text-xs font-bold'
                        : 'fill-muted-foreground text-xs'
                    }
                  >
                    {payload.value}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="income" name={t('dashboard.income')} radius={[2, 2, 0, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={INCOME_COLOR} fillOpacity={entry.opacity} />
                ))}
              </Bar>
              <Bar
                dataKey="expenses"
                name={t('dashboard.expenses')}
                radius={[2, 2, 0, 0]}
                barSize={12}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={EXPENSE_COLOR} fillOpacity={entry.opacity} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
