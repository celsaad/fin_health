import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreakdownItem } from '@/hooks/useDashboard';

const COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#84cc16', // lime
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: BreakdownItem;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium">{data.categoryName}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(data.total)} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
}

interface ExpensePieChartProps {
  breakdown: BreakdownItem[];
}

export function ExpensePieChart({ breakdown }: ExpensePieChartProps) {
  if (breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No expense data for this period</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...breakdown].sort((a, b) => b.total - a.total);
  const chartHeight = Math.max(300, sorted.length * 48);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 80 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="categoryName"
              width={120}
              tick={{ fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={28} label={({ x, y, width, height, value, index }) => (
              <text
                x={x + width + 8}
                y={y + height / 2}
                textAnchor="start"
                dominantBaseline="central"
                className="fill-muted-foreground text-xs"
              >
                {formatCurrency(value as number)} ({sorted[index as number].percentage.toFixed(0)}%)
              </text>
            )}>
              {sorted.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
