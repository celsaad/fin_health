import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { Transaction } from '@/hooks/useTransactions';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const config = getCategoryIcon(transaction.category.name, transaction.category.icon, transaction.category.color);
  const Icon = config.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
      >
        <Icon className={`size-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{transaction.description}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 ${
              isIncome
                ? 'border-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'border-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {isIncome ? 'INCOME' : 'EXPENSE'}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">
            {transaction.category.name}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm font-semibold ${
            isIncome
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(transaction)}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DateGroupHeader({ date }: { date: string }) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = `Today, ${format(d, 'MMM dd')}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = `Yesterday, ${format(d, 'MMM dd')}`;
  } else {
    label = format(d, 'EEE, MMM dd, yyyy');
  }

  return (
    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider pt-4 pb-1 first:pt-0">
      {label}
    </p>
  );
}
