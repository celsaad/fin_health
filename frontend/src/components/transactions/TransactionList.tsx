import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import {
  useDeleteTransaction,
  useBulkDeleteTransactions,
  type Transaction,
} from '@/hooks/useTransactions';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const deleteMutation = useDeleteTransaction();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const allSelected =
    transactions.length > 0 && selectedIds.size === transactions.length;
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
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
          >
            <Trash2 className="size-4" />
            Delete selected
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
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
                      <span className="text-sm font-medium">
                        {transaction.description}
                      </span>
                      {transaction.notes && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {transaction.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
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
                        aria-label="Edit transaction"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeletingId(transaction.id)}
                        aria-label="Delete transaction"
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
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title="Delete Selected Transactions"
        description={`Are you sure you want to delete ${selectedIds.size} transaction${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        variant="destructive"
        confirmLabel="Delete All"
      />
    </>
  );
}
