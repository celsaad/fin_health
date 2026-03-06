import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible } from 'radix-ui';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { CategorySpending } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const CATEGORY_COLORS = [
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

interface CategoryAccordionProps {
  category: CategorySpending;
  colorIndex?: number;
  defaultOpen?: boolean;
}

export function CategoryAccordion({ category, colorIndex = 0, defaultOpen = false }: CategoryAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card>
        <Collapsible.Trigger asChild>
          <button className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-2xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate">{category.categoryName}</span>
                </div>
                <span className="font-semibold shrink-0">{formatCurrency(category.total)}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2 pl-5.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(category.percentage, 100)}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-sm text-muted-foreground shrink-0 w-14 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'ml-4 size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <CardContent className="pt-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Subcategory</TableHead>
                  <TableHead className="w-[25%] text-right pr-6">Amount</TableHead>
                  <TableHead className="w-[30%]">% of Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.subcategories.map((sub) => (
                  <TableRow key={sub.subcategoryId ?? 'uncategorized'}>
                    <TableCell className="font-medium">{sub.subcategoryName}</TableCell>
                    <TableCell className="text-right pr-6">{formatCurrency(sub.total)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(sub.percentage, 100)}%`,
                              backgroundColor: color,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {sub.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Collapsible.Content>
      </Card>
    </Collapsible.Root>
  );
}
