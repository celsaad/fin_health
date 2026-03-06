import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FrequencyBadge } from '@/components/recurring/FrequencyBadge';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useToggleRecurring, type RecurringTransaction } from '@/hooks/useRecurring';
import { formatCurrency } from '@fin-health/shared/format';

interface RecurringCardProps {
  transaction: RecurringTransaction;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
}

export const RecurringCard = memo(function RecurringCard({
  transaction,
  onEdit,
  onDelete,
}: RecurringCardProps) {
  const { t } = useTranslation();
  const toggleRecurring = useToggleRecurring();
  const categoryName = transaction.category?.name ?? '';
  const config = getCategoryIcon(
    categoryName,
    transaction.category?.icon,
    transaction.category?.color,
  );
  const Icon = config.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors ${
        !transaction.isActive ? 'opacity-60' : ''
      }`}
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.darkBgColor}`}
      >
        <Icon className={`size-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{transaction.description}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {t('recurring.next')}: {format(new Date(transaction.startDate), 'MMM dd')}
          </span>
          <FrequencyBadge frequency={transaction.frequency} />
          {!transaction.isActive && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {t('recurring.paused')}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`text-sm font-semibold ${
            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(transaction.amount)}
        </span>
        <Switch
          checked={transaction.isActive}
          onCheckedChange={() => toggleRecurring.mutate(transaction.id)}
        />
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(transaction)}
            aria-label={t('recurring.editAriaLabel')}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(transaction.id)}
            aria-label={t('recurring.deleteAriaLabel')}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
});
