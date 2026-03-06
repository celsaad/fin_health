import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionCard, DateGroupHeader } from '@/components/transactions/TransactionCard';
import {
  useDeleteTransaction,
  useBulkDeleteTransactions,
  type Transaction,
} from '@/hooks/useTransactions';
import { formatCurrency } from '@fin-health/shared/format';

interface TransactionListProps {
  transactions: Transaction[];
}

function groupByDate(transactions: Transaction[]) {
  const groups: { date: string; transactions: Transaction[] }[] = [];
  let currentDate = '';

  for (const txn of transactions) {
    const day = txn.date.slice(0, 10);
    if (day !== currentDate) {
      currentDate = day;
      groups.push({ date: day, transactions: [txn] });
    } else {
      groups[groups.length - 1].transactions.push(txn);
    }
  }
  return groups;
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const deleteMutation = useDeleteTransaction();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const dateGroups = useMemo(() => groupByDate(transactions), [transactions]);

  const allSelected = transactions.length > 0 && selectedIds.size === transactions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteMutation.mutateAsync(deletingId);
    setDeletingId(null);
    selectedIds.delete(deletingId);
    setSelectedIds(new Set(selectedIds));
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkDelete(false);
  };

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{t('transactions.selected', { count: selectedIds.size })}</span>
          <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
            <Trash2 className="size-4" />
            {t('transactions.deleteSelected')}
          </Button>
        </div>
      )}

      {/* Card layout for mobile */}
      <div className="lg:hidden space-y-1">
        {dateGroups.map((group) => (
          <div key={group.date}>
            <DateGroupHeader date={group.date} />
            <div className="space-y-2">
              {group.transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={setEditingTransaction}
                  onDelete={setDeletingId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table layout for desktop */}
      <div className="hidden lg:block rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                    onCheckedChange={toggleAll}
                    aria-label={t('transactions.selectAll')}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t('transactions.date')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t('transactions.description')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t('transactions.categoryLabel')}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  {t('transactions.amount')}
                </th>
                <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(transaction.id)}
                      onCheckedChange={() => toggleOne(transaction.id)}
                      aria-label={`Select ${transaction.description}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{transaction.description}</span>
                      {transaction.notes && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {transaction.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category.name}
                      </Badge>
                      {transaction.subcategory && (
                        <span className="text-xs text-muted-foreground">
                          / {transaction.subcategory.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setEditingTransaction(transaction)}
                        aria-label={t('transactions.editTransactionAriaLabel')}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeletingId(transaction.id)}
                        aria-label={t('transactions.deleteTransactionAriaLabel')}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionForm
        open={!!editingTransaction}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction ?? undefined}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title={t('transactions.deleteTransaction')}
        description={t('transactions.deleteTransactionConfirm')}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={t('common.delete')}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={t('transactions.deleteSelectedTitle')}
        description={t('transactions.deleteSelectedConfirm', { count: selectedIds.size })}
        onConfirm={handleBulkDelete}
        variant="destructive"
        confirmLabel={t('transactions.deleteAll')}
      />
    </>
  );
}
