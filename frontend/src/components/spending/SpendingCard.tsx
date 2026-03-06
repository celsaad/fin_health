import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { formatCurrency, formatPercent } from '@fin-health/shared/format';

export const CATEGORY_COLORS = [
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

interface SpendingCardProps {
  categoryName: string;
  total: number;
  percentage: number;
  colorIndex: number;
  selected: boolean;
  onClick: () => void;
}

export function SpendingCard({
  categoryName,
  total,
  percentage,
  colorIndex,
  selected,
  onClick,
}: SpendingCardProps) {
  const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
  const config = getCategoryIcon(categoryName);
  const Icon = config.icon;

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/30',
        selected && 'ring-2 ring-primary',
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
          >
            <Icon className={`size-4 ${config.color}`} aria-hidden="true" />
          </div>
          <span className="font-medium truncate">{categoryName}</span>
          <span className="ml-auto font-semibold shrink-0">{formatCurrency(total)}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 pl-10.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground shrink-0 w-14 text-right">
            {formatPercent(percentage, 1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
