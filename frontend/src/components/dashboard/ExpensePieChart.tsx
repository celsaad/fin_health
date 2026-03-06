import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreakdownItem } from '@/hooks/useDashboard';
import { formatCurrency } from '@fin-health/shared/format';

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

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: BreakdownItem & { fill: string };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
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
  const totalSpent = sorted.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sorted}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                dataKey="total"
                nameKey="categoryName"
                paddingAngle={2}
                strokeWidth={0}
              >
                {sorted.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
            <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
              Spent
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
          {sorted.map((item, i) => (
            <div key={item.categoryId} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{item.categoryName}</span>
              <span className="ml-auto font-medium">{item.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
