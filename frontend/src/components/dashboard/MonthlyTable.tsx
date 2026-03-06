import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BreakdownItem } from '@/hooks/useDashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

interface MonthlyTableProps {
  breakdown: BreakdownItem[];
}

export function MonthlyTable({ breakdown }: MonthlyTableProps) {
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...breakdown].sort((a, b) =>
    sortAsc ? a.total - b.total : b.total - a.total
  );

  if (breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No expenses for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Amount
                  <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
              <TableRow key={item.categoryId}>
                <TableCell className="font-medium">
                  <Link
                    to={`/spending?category=${item.categoryId}`}
                    className="hover:underline hover:text-primary transition-colors"
                  >
                    {item.categoryName}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(item.total)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
