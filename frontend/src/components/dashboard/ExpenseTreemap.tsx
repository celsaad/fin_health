import { useTranslation } from 'react-i18next';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
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

interface TreemapLeaf {
  name: string;
  value: number;
  color: string;
  categoryName: string;
}

function buildTreemapData(categories: CategorySpending[]) {
  return categories
    .filter((cat) => cat.total > 0)
    .map((cat, i) => {
      const color = COLORS[i % COLORS.length];
      const hasRealSubcategories = cat.subcategories.some(
        (s) => s.subcategoryName !== 'Uncategorized',
      );

      const children: TreemapLeaf[] = hasRealSubcategories
        ? cat.subcategories
            .filter((sub) => sub.total > 0)
            .map((sub) => ({
              name:
                sub.subcategoryName === 'Uncategorized'
                  ? `${cat.categoryName} (other)`
                  : sub.subcategoryName,
              value: sub.total,
              color,
              categoryName: cat.categoryName,
            }))
        : [
            {
              name: cat.categoryName,
              value: cat.total,
              color,
              categoryName: cat.categoryName,
            },
          ];

      return { name: cat.categoryName, children };
    });
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return maxChars > 3 ? text.slice(0, maxChars - 1) + '\u2026' : '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomContent(props: any) {
  const { x, y, width, height, depth, name, value, color } = props;

  if (depth !== 2 || width <= 0 || height <= 0) return null;

  const showName = width > 40 && height > 22;
  const showValue = width > 55 && height > 40;
  const maxChars = Math.floor((width - 12) / 7);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="hsl(var(--card))"
        strokeWidth={2}
        rx={4}
      />
      {showName && (
        <text
          x={x + 6}
          y={y + 16}
          fontSize={12}
          fontWeight={600}
          fill="#fff"
          style={{ pointerEvents: 'none' }}
        >
          {truncate(name, maxChars)}
        </text>
      )}
      {showValue && (
        <text
          x={x + 6}
          y={y + 31}
          fontSize={11}
          fill="rgba(255,255,255,0.75)"
          style={{ pointerEvents: 'none' }}
        >
          {truncate(formatCurrency(value), maxChars)}
        </text>
      )}
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as TreemapLeaf;
  const isSubcategory = data.categoryName && data.name !== data.categoryName;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      {isSubcategory && <p className="text-xs text-muted-foreground">{data.categoryName}</p>}
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
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
  const treemapData = buildTreemapData(sorted);
  const totalSpent = sorted.reduce((sum, item) => sum + item.total, 0);

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
        <ResponsiveContainer width="100%" height={260}>
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            content={<CustomContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
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
